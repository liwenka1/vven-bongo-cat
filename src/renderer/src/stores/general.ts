import { defineStore } from 'pinia';

export const useGeneralStore = defineStore('general', {
  state: () => ({
    theme: 'light',
    language: 'en',
    autoStart: false,
    autoUpdate: true,
  }),
  actions: {
    setTheme(value: 'light' | 'dark') {
      this.theme = value;
    },
    setLanguage(value: string) {
      this.language = value;
    },
    setAutoStart(value: boolean) {
      this.autoStart = value;
    },
    setAutoUpdate(value: boolean) {
      this.autoUpdate = value;
    },
  },
}); 