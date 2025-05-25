import { onUnmounted } from "vue";
import { useAppStore } from "@/stores/app";

// Electron IPC 事件监听器
export const useAppListen = (channel: string, callback: (...args: unknown[]) => void) => {
  // 设置监听器
  window.electron?.on(channel, callback);

  // 组件卸载时清理监听器
  onUnmounted(() => {
    window.electron?.off(channel, callback);
  });
};

// 应用级别的事件监听器设置
export const useAppEventListeners = () => {
  const appStore = useAppStore();

  const setupListeners = () => {
    // 窗口状态变化监听
    window.electron?.on("window-state-changed", (...args: unknown[]) => {
      const data = args[0] as { isMaximized?: boolean };
      if (data?.isMaximized !== undefined) {
        appStore.setMaximized(data.isMaximized);
      }
    });

    // 更新相关事件监听
    window.electron?.on("update-available", (...args: unknown[]) => {
      const version = args[0] as string;
      appStore.setLatestVersion(version);
      appStore.setUpdateAvailable(true);
    });

    window.electron?.on("update-progress", (...args: unknown[]) => {
      const progress = args[0] as number;
      appStore.setUpdateProgress(progress);
    });

    window.electron?.on("update-downloaded", () => {
      appStore.setIsUpdating(false);
    });
  };

  const cleanupListeners = () => {
    // 清理所有监听器
    window.electron?.off("window-state-changed", () => {});
    window.electron?.off("update-available", () => {});
    window.electron?.off("update-progress", () => {});
    window.electron?.off("update-downloaded", () => {});
  };

  return {
    setupListeners,
    cleanupListeners
  };
};
