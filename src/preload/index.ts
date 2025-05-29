import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Define menu item interface
interface MenuItemTemplate {
  label?: string;
  type?: "normal" | "separator" | "submenu" | "checkbox" | "radio";
  accelerator?: string;
  checked?: boolean;
  enabled?: boolean;
  click?: () => void;
  action?: string;
  data?: unknown;
  submenu?: MenuItemTemplate[];
}

// Custom APIs for renderer
const api = {
  // Window management
  showWindow: () => ipcRenderer.invoke("window:show"),
  hideWindow: () => ipcRenderer.invoke("window:hide"),
  setIgnoreMouse: (value: boolean) => ipcRenderer.invoke("window:setIgnoreMouse", value),
  startDragging: () => ipcRenderer.invoke("window:startDragging"),
  setWindowSize: (width: number, height: number) => ipcRenderer.invoke("window:setSize", { width, height }),
  setWindowPosition: (x: number, y: number) => ipcRenderer.invoke("window:setPosition", { x, y }),
  getWindowSize: () => ipcRenderer.invoke("window:getSize"),
  getWindowPosition: () => ipcRenderer.invoke("window:getPosition"),

  // Monitor and cursor
  getCursorMonitor: () => ipcRenderer.invoke("screen:getCursorMonitor"),

  // Global listener control
  global: {
    startListener: () => ipcRenderer.invoke("global:startListener"),
    stopListener: () => ipcRenderer.invoke("global:stopListener"),
    isListenerActive: () => ipcRenderer.invoke("global:isListenerActive")
  },

  // Menu
  showContextMenu: (menuTemplate: MenuItemTemplate[]) => ipcRenderer.invoke("menu:showContextMenu", menuTemplate),

  // Shell operations
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url),

  // Event handling
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args));
  },
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback as (...args: unknown[]) => void);
  },
  once: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.once(channel, (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args));
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", api);
    contextBridge.exposeInMainWorld("electronAPI", electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = api;
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI;
}
