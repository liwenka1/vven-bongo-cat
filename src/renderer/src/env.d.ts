/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

interface IpcEvent {
  sender: unknown;
  senderId: number;
}

interface ElectronAPI {
  showWindow: () => Promise<void>;
  hideWindow: () => Promise<void>;
  setIgnoreMouse: (value: boolean) => Promise<void>;
  startDragging: () => Promise<void>;
  setWindowSize: (width: number, height: number) => Promise<void>;
  setWindowPosition: (x: number, y: number) => Promise<void>;
  getWindowSize: () => Promise<[number, number]>;
  getCursorMonitor: () => Promise<{
    name: string;
    size: { width: number; height: number };
    position: { x: number; y: number; width: number; height: number };
    scaleFactor: number;
    cursorPosition: { x: number; y: number };
  }>;
  showContextMenu: (menuTemplate: MenuItemTemplate[]) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  off: (channel: string, callback: (...args: unknown[]) => void) => void;
  once: (channel: string, callback: (...args: unknown[]) => void) => void;
}

interface MenuItemTemplate {
  label?: string;
  type?: "normal" | "separator" | "submenu" | "checkbox" | "radio";
  accelerator?: string;
  checked?: boolean;
  enabled?: boolean;
  click?: () => void;
  action?: string;
  data?: unknown;
  submenu?: MenuItemTemplate[];
}

interface Window {
  electron: ElectronAPI;
  electronAPI: unknown;
}
