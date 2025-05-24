interface ElectronAPI {
  // Window management
  showWindow: () => Promise<void>;
  hideWindow: () => Promise<void>;
  setIgnoreMouse: (value: boolean) => Promise<void>;
  startDragging: () => Promise<void>;
  setWindowSize: (width: number, height: number) => Promise<void>;
  getWindowSize: () => Promise<[number, number]>;
  getCursorMonitor: () => Promise<{
    name?: string | null;
    size: { width: number; height: number };
    position: { x: number; y: number };
    scaleFactor: number;
    cursorPosition: { x: number; y: number };
  }>;

  // Shell operations
  openExternal: (url: string) => Promise<void>;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  off: (channel: string, callback: (...args: unknown[]) => void) => void;
  once: (channel: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    electronAPI?: unknown;
  }
}

export {};
