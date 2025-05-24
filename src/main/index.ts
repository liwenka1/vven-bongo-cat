import { app, shell, BrowserWindow, ipcMain, screen } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 300, // Default size for the cat window
    height: 300,
    show: false,
    frame: false, // Frameless window for the cat
    transparent: true,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false // 临时禁用 web 安全性以便加载本地资源
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // IPC handlers for window management
  ipcMain.handle("window:show", () => {
    mainWindow.show();
  });

  ipcMain.handle("window:hide", () => {
    mainWindow.hide();
  });

  ipcMain.handle("window:setIgnoreMouse", (_, value: boolean) => {
    mainWindow.setIgnoreMouseEvents(value, { forward: true });
  });

  ipcMain.handle("window:startDragging", () => {
    mainWindow.webContents.startDrag({
      file: "",
      icon: null
    });
  });

  ipcMain.handle("window:setSize", (_, { width, height }) => {
    mainWindow.setSize(width, height);
  });

  ipcMain.handle("window:getSize", () => {
    return mainWindow.getSize();
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

  // Handle external URLs
  ipcMain.handle("shell:openExternal", (_, url: string) => {
    return shell.openExternal(url);
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
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

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
