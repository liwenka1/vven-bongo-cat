declare global {
  interface Window {
    Live2D: {
      getVersionStr(): string;
      [key: string]: any;
    };
    Live2DCubismCore: object;
  }
}

export {};
