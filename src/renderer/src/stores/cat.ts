import { defineStore } from "pinia";

export const useCatStore = defineStore("cat", {
  state: () => ({
    isPlaying: false,
    currentModel: "",
    currentDevice: "",
    models: [] as string[],
    devices: [] as string[],
    mode: "standard"
  }),
  actions: {
    setPlaying(value: boolean) {
      this.isPlaying = value;
    },
    setCurrentModel(value: string) {
      this.currentModel = value;
    },
    setCurrentDevice(value: string) {
      this.currentDevice = value;
    },
    setModels(value: string[]) {
      this.models = value;
    },
    setDevices(value: string[]) {
      this.devices = value;
    },
    setMode(value: string) {
      this.mode = value;
    },
    async $electron() {
      return {
        async init() {
          return Promise.resolve();
        }
      };
    }
  }
});
