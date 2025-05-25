// Electron 窗口管理工具

type WindowLabel = "main" | "preference";

export function showWindow(label?: WindowLabel) {
  console.log(`显示窗口: ${label || "main"}`);
  window.electron?.showWindow();
}

export function hideWindow(label?: WindowLabel) {
  console.log(`隐藏窗口: ${label || "main"}`);
  window.electron?.hideWindow();
}

export function setWindowSize(width: number, height: number) {
  window.electron?.setWindowSize(width, height);
}

export function setWindowPosition(x: number, y: number) {
  window.electron?.setWindowPosition(x, y);
}

export function getWindowSize() {
  return window.electron?.getWindowSize();
}
