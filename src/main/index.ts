import { app, shell, BrowserWindow, screen, nativeImage, Menu, Tray, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import iconPath from "../../resources/icon.png?asset";

// 全局变量
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuiting = false;

// 全局键盘监听状态
let globalListenerActive = false;

function createWindow(): void {
  const icon = nativeImage.createFromPath(iconPath);

  // Create the browser window with non-intrusive configuration
  mainWindow = new BrowserWindow({
    width: 300,
    height: 300,
    show: false, // 初始不显示
    frame: false, // 无边框
    transparent: true, // 透明背景
    autoHideMenuBar: true,
    alwaysOnTop: true,

    // 非侵入式配置 - 修改为允许接收键盘事件但保持非侵入性
    focusable: true, // 允许窗口获取焦点以接收键盘事件
    skipTaskbar: true, // 不在任务栏显示
    resizable: true, // 允许调整大小 - 修复尺寸调整问题
    minimizable: false, // 不可最小化
    maximizable: false, // 不可最大化
    movable: true, // 保持可移动（用户可能需要调整位置）
    closable: true, // 保持可关闭
    hasShadow: false, // 无阴影，更透明

    // 平台特殊配置
    type: process.platform === "darwin" ? "panel" : undefined,

    icon,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false // 禁止后台节流
    }
  });

  // 平台特殊处理
  if (process.platform === "win32") {
    // Windows: 设置为桌面层窗口
    mainWindow.setAlwaysOnTop(true, "screen-saver");
    mainWindow.setSkipTaskbar(true);
  } else if (process.platform === "linux") {
    // Linux: 设置在所有工作区可见
    mainWindow.setVisibleOnAllWorkspaces(true);
  }

  mainWindow.on("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
      // 移除强制blur调用，让窗口可以接收键盘事件
    }
  });

  // 移除focus事件的强制blur处理，这样窗口可以正常接收键盘事件

  mainWindow.on("show", () => {
    if (mainWindow) {
      mainWindow.setSkipTaskbar(true);
      // 移除强制blur调用
    }
  });

  // 窗口关闭处理 - 隐藏而不是真正关闭
  mainWindow.on("close", (event) => {
    if (!isQuiting) {
      event.preventDefault();
      mainWindow?.hide();

      // 显示托盘提示
      if (tray && process.platform === "win32") {
        tray.displayBalloon({
          iconType: "info",
          title: "Bongo Cat",
          content: "应用已最小化到系统托盘，继续在后台运行"
        });
      }
    }
  });

  // 监听窗口移动和大小变化
  mainWindow.on("move", () => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      mainWindow.webContents.send("window-state-changed", { x, y });
    }
  });

  mainWindow.on("resize", () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize();
      mainWindow.webContents.send("window-state-changed", { width, height });
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Load the app
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // 禁用系统右键菜单（仅Windows）
  if (process.platform === "win32") {
    try {
      mainWindow.hookWindowMessage(278, () => {
        if (mainWindow) {
          mainWindow.setEnabled(false);
          setTimeout(() => mainWindow?.setEnabled(true), 100);
        }
        return true;
      });
    } catch (error) {
      console.log("Failed to hook window message:", error);
    }
  }
}

// 创建系统托盘
function createTray(): void {
  if (!tray) {
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "显示窗口",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: "隐藏窗口",
        click: () => {
          if (mainWindow) {
            mainWindow.hide();
          }
        }
      },
      { type: "separator" },
      {
        label: `键盘监听: ${globalListenerActive ? '已启用' : '已禁用'}`,
        type: 'checkbox',
        checked: globalListenerActive,
        click: () => {
          globalListenerActive ? stopGlobalListener() : startGlobalListener();
        }
      },
      { type: "separator" },
      {
        label: "开机自启动",
        type: "checkbox",
        checked: app.getLoginItemSettings().openAtLogin,
        click: () => {
          const { openAtLogin } = app.getLoginItemSettings();
          app.setLoginItemSettings({
            openAtLogin: !openAtLogin,
            path: app.getPath("exe")
          });
        }
      },
      { type: "separator" },
      {
        label: "退出",
        click: () => {
          isQuiting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip("Bongo Cat - 后台运行中");
    tray.setContextMenu(contextMenu);

    // 托盘图标点击显示/隐藏窗口
    tray.on("click", () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      }
    });
  }
}

// 启动全局键盘监听 (现在只是状态管理，不实际拦截系统输入)
function startGlobalListener(): void {
  if (globalListenerActive) return;

  if (is.dev) {
    console.log("🚀 启动键盘监听...");
  }

  try {
    // 不再注册全局快捷键，避免拦截系统输入
    // 改为依赖窗口内监听，这样不会影响其他应用程序的输入

    globalListenerActive = true;

    if (is.dev) {
      console.log("✅ 键盘监听已启动（窗口内模式）");
    }

    // 更新托盘菜单
    updateTrayMenu();

  } catch (error) {
    console.error("❌ 启动键盘监听失败:", error);
  }
}

// 停止全局键盘监听
function stopGlobalListener(): void {
  if (!globalListenerActive) return;

  if (is.dev) {
    console.log("🛑 停止键盘监听...");
  }

  try {
    // 不再需要取消注册全局快捷键
    globalListenerActive = false;

    if (is.dev) {
      console.log("✅ 键盘监听已停止");
    }

    // 更新托盘菜单
    updateTrayMenu();

  } catch (error) {
    console.error("❌ 停止键盘监听失败:", error);
  }
}

// 更新托盘菜单
function updateTrayMenu(): void {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示窗口",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: "隐藏窗口",
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: "separator" },
    {
      label: `键盘监听: ${globalListenerActive ? '已启用' : '已禁用'}`,
      type: 'checkbox',
      checked: globalListenerActive,
      click: () => {
        globalListenerActive ? stopGlobalListener() : startGlobalListener();
      }
    },
    { type: "separator" },
    {
      label: "开机自启动",
      type: "checkbox",
      checked: app.getLoginItemSettings().openAtLogin,
      click: () => {
        const { openAtLogin } = app.getLoginItemSettings();
        app.setLoginItemSettings({
          openAtLogin: !openAtLogin,
          path: app.getPath("exe")
        });
      }
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.vven.bongocat");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // 1. 立即启动全局监听
  startGlobalListener();

  // 2. 创建窗口
  createWindow();

  // 3. 创建系统托盘
  createTray();

  // 4. 设置IPC处理器
  setupIpcHandlers();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 防止应用意外退出 - 后台持续运行
app.on("window-all-closed", (event) => {
  // 阻止默认关闭行为，保持后台运行
  event.preventDefault();

  if (process.platform !== "darwin") {
    // Windows/Linux: 隐藏窗口但保持应用运行
    if (mainWindow) {
      mainWindow.hide();
    }
  }
});

// 应用真正退出前的清理
app.on("before-quit", (event) => {
  if (!isQuiting) {
    event.preventDefault();
    return;
  }

  // 清理全局监听
  stopGlobalListener();

  // 清理托盘
  if (tray) {
    tray.destroy();
  }
});

// 设置IPC处理器
function setupIpcHandlers(): void {
  // 基础窗口控制
  ipcMain.handle("window:show", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  ipcMain.handle("window:hide", () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });

  ipcMain.handle("window:setIgnoreMouse", (_, value: boolean) => {
    if (mainWindow) {
      mainWindow.setIgnoreMouseEvents(value, { forward: true });
    }
  });

  ipcMain.handle("window:startDragging", () => {
    return true;
  });

  ipcMain.handle("window:setSize", (_, { width, height }) => {
    if (mainWindow) {
      mainWindow.setSize(width, height);
    }
  });

  ipcMain.handle("window:setPosition", (_, { x, y }) => {
    if (mainWindow) {
      mainWindow.setPosition(x, y);
    }
  });

  ipcMain.handle("window:getSize", () => {
    if (mainWindow) {
      return mainWindow.getSize();
    }
    return [300, 300];
  });

  ipcMain.handle("window:getPosition", () => {
    if (mainWindow) {
      return mainWindow.getPosition();
    }
    return [0, 0];
  });

  ipcMain.handle("screen:getCursorMonitor", () => {
    const cursorPoint = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(cursorPoint);

    return {
      name: display.id.toString(),
      size: display.size,
      position: display.bounds,
      scaleFactor: display.scaleFactor,
      cursorPosition: cursorPoint
    };
  });

  // 全局监听控制
  ipcMain.handle("global:startListener", () => {
    startGlobalListener();
    return globalListenerActive;
  });

  ipcMain.handle("global:stopListener", () => {
    stopGlobalListener();
    return globalListenerActive;
  });

  ipcMain.handle("global:isListenerActive", () => {
    return globalListenerActive;
  });

  // Handle context menu
  ipcMain.handle("menu:showContextMenu", (_, menuTemplate: unknown[]) => {
    if (!mainWindow) return;

    const processMenuItem = (item: Record<string, unknown>): Record<string, unknown> => {
      if (item.type === "separator") {
        return { type: "separator" };
      }

      const processedItem: Record<string, unknown> = {
        label: item.label,
        type: item.type || "normal",
        checked: item.checked,
        enabled: item.enabled !== false
      };

      if (item.accelerator) {
        processedItem.accelerator = item.accelerator;
      }

      if (item.submenu && Array.isArray(item.submenu)) {
        processedItem.submenu = item.submenu.map((subItem: Record<string, unknown>) => processMenuItem(subItem));
      } else if (item.action) {
        processedItem.click = () => {
          if (mainWindow) {
            mainWindow.webContents.send("menu:action", item.action, item.data);
          }
        };
      }

      return processedItem;
    };

    const processedTemplate = menuTemplate.map((item: unknown) => processMenuItem(item as Record<string, unknown>));
    const menu = Menu.buildFromTemplate(processedTemplate);
    menu.popup({ window: mainWindow });
  });

  // Handle external URLs
  ipcMain.handle("shell:openExternal", (_, url: string) => {
    return shell.openExternal(url);
  });
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
