import { defineStore } from "pinia";
import type { WindowState } from "../composables/useWindowState";

export const useAppStore = defineStore("app", {
  state: () => ({
    isMaximized: false,
    version: "",
    latestVersion: "",
    updateAvailable: false,
    updateProgress: 0,
    isUpdating: false,
    windowState: {} as WindowState
  }),
  actions: {
    setMaximized(value: boolean) {
      this.isMaximized = value;
    },
    setVersion(value: string) {
      this.version = value;
    },
    setLatestVersion(value: string) {
      this.latestVersion = value;
    },
    setUpdateAvailable(value: boolean) {
      this.updateAvailable = value;
    },
    setUpdateProgress(value: number) {
      this.updateProgress = value;
    },
    setIsUpdating(value: boolean) {
      this.isUpdating = value;
    },
    setWindowState(value: WindowState) {
      this.windowState = value;
    },
    async $electron() {
      return {
        async init() {
          // 这里可以从 electron store 或配置文件加载设置
          return Promise.resolve();
        }
      };
    }
  }
});
