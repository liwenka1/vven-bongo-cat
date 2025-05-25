// Electron 平台检测工具
// 在 Electron 中，可以通过 process.platform 获取平台信息

let currentPlatform = "";

try {
  // 在 Electron 渲染进程中获取平台信息
  if (typeof process !== "undefined" && process.platform) {
    currentPlatform = process.platform;
  } else if (typeof navigator !== "undefined" && navigator.platform) {
    // 浏览器环境的回退方案
    const navPlatform = navigator.platform.toLowerCase();
    if (navPlatform.startsWith("mac")) currentPlatform = "darwin";
    else if (navPlatform.startsWith("win")) currentPlatform = "win32";
    else if (navPlatform.includes("linux")) currentPlatform = "linux";
  }
} catch (e) {
  console.warn("无法自动检测平台信息");
}

export const isMac = currentPlatform === "darwin";
export const isWindows = currentPlatform === "win32";
export const isLinux = currentPlatform === "linux";
export const platform = currentPlatform;
