import { defineStore } from "pinia";

export type CatMode = "standard" | "keyboard";

export const useCatStore = defineStore("cat", {
  state: () => ({
    isPlaying: false,
    currentModel: "",
    currentDevice: "",
    models: [] as string[],
    devices: [] as string[],
    mode: "standard" as CatMode,
    scale: 100,
    opacity: 100,
    mirrorMode: false,
    singleMode: false,
    penetrable: false
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
    setMode(value: CatMode) {
      this.mode = value;
    },
    setScale(value: number) {
      this.scale = value;
    },
    setOpacity(value: number) {
      this.opacity = value;
    },
    setMirrorMode(value: boolean) {
      this.mirrorMode = value;
    },
    setSingleMode(value: boolean) {
      this.singleMode = value;
    },
    setPenetrable(value: boolean) {
      this.penetrable = value;
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
