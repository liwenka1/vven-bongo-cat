import { Store } from "pinia";

declare module "pinia" {
  export interface PiniaCustomProperties {
    $electron?: {
      init(): Promise<void>;
    };
  }
}

export {};
