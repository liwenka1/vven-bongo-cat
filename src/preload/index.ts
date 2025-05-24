import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {
  // Window management
  showWindow: () => ipcRenderer.invoke("window:show"),
  hideWindow: () => ipcRenderer.invoke("window:hide"),
  setIgnoreMouse: (value: boolean) => ipcRenderer.invoke("window:setIgnoreMouse", value),
  startDragging: () => ipcRenderer.invoke("window:startDragging"),
  setWindowSize: (width: number, height: number) => ipcRenderer.invoke("window:setSize", { width, height }),
  getWindowSize: () => ipcRenderer.invoke("window:getSize"),

  // Monitor and cursor
  getCursorMonitor: () => ipcRenderer.invoke("screen:getCursorMonitor"),

  // Shell operations
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url),

  // Event handling
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: any[]) => callback(...args));
  },
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback as any);
  },
  once: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (_event: IpcRendererEvent, ...args: any[]) => callback(...args));
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
