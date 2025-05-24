/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface Window {
  electron: {
    ipcRenderer: {
      on(channel: string, func: (...args: any[]) => void): void;
      send(channel: string, ...args: any[]): void;
    };
  };
}
