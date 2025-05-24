import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    isMaximized: false,
    version: '',
    latestVersion: '',
    updateAvailable: false,
    updateProgress: 0,
    isUpdating: false,
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
  },
}); 