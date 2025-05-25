// Electron 显示器管理工具

interface ElectronPoint {
  x: number;
  y: number;
}

interface ElectronSize {
  width: number;
  height: number;
}

interface CursorMonitorInfo {
  name?: string | null;
  size: ElectronSize;
  position: ElectronPoint;
  scaleFactor: number;
  cursorPosition: ElectronPoint;
}

export async function getCursorMonitor(): Promise<CursorMonitorInfo | undefined> {
  try {
    if (!window.electron?.getCursorMonitor) {
      console.warn("Electron getCursorMonitor API 不可用");
      return undefined;
    }
    return await window.electron.getCursorMonitor();
  } catch (error) {
    console.error("获取光标显示器信息时出错:", error);
    return undefined;
  }
}
