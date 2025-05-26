import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  state: () => ({
    theme: "light",
    language: "en",
    autoStart: false,
    autoUpdate: true,
    autostart: false,
    autoCheckUpdate: true
  }),
  actions: {
    setTheme(value: "light" | "dark") {
      this.theme = value;
    },
    setLanguage(value: string) {
      this.language = value;
    },
    setAutoStart(value: boolean) {
      this.autoStart = value;
      this.autostart = value;
    },
    setAutoUpdate(value: boolean) {
      this.autoUpdate = value;
      this.autoCheckUpdate = value;
    },
    setAutostart(value: boolean) {
      this.autostart = value;
      this.autoStart = value;
    },
    setAutoCheckUpdate(value: boolean) {
      this.autoCheckUpdate = value;
      this.autoUpdate = value;
    }
  }
});
