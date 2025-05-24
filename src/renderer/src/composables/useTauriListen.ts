import { useAppStore } from "@/stores/app";

interface IpcEvent {
  sender: unknown;
  senderId: number;
}

export const useAppListen = () => {
  const appStore = useAppStore();

  const setupListeners = () => {
    // 这里可以添加应用程序的事件监听器
    // 例如：窗口状态变化、更新检查等
    window.electron?.ipcRenderer.on("window-state-changed", (_event: IpcEvent, isMaximized: boolean) => {
      appStore.setMaximized(isMaximized);
    });

    window.electron?.ipcRenderer.on("update-available", (_event: IpcEvent, version: string) => {
      appStore.setLatestVersion(version);
      appStore.setUpdateAvailable(true);
    });

    window.electron?.ipcRenderer.on("update-progress", (_event: IpcEvent, progress: number) => {
      appStore.setUpdateProgress(progress);
    });

    window.electron?.ipcRenderer.on("update-downloaded", () => {
      appStore.setIsUpdating(false);
    });
  };

  return {
    setupListeners
  };
};
