// import { platform as tauriPlatform } from '@tauri-apps/plugin-os' // TAURI-SPECIFIC

// In Electron, process.platform can be used. (e.g., 'darwin', 'win32', 'linux')
// This will work in renderer if nodeIntegration is true, or can be exposed via preload.

let currentPlatform = "";
try {
  // Try to get it from Electron's process object if available (e.g. in preload or main)
  // For renderer, this might need to be exposed via contextBridge if nodeIntegration is false.
  if (typeof process !== "undefined" && process.platform) {
    currentPlatform = process.platform;
  } else if (typeof navigator !== "undefined" && navigator.platform) {
    // Fallback for basic web environment if process is not available
    const navPlatform = navigator.platform.toLowerCase();
    if (navPlatform.startsWith("mac")) currentPlatform = "darwin";
    else if (navPlatform.startsWith("win")) currentPlatform = "win32";
    else if (navPlatform.includes("linux")) currentPlatform = "linux";
  }
} catch (e) {
  console.warn("Could not determine platform automatically.");
}

export const isMac = currentPlatform === "darwin";
export const isWindows = currentPlatform === "win32";
export const isLinux = currentPlatform === "linux";

// Function to explicitly set platform if needed (e.g. from main process via IPC)
export function setPlatform(platformValue: string) {
  currentPlatform = platformValue;
  // Re-evaluate constants - this is tricky, better to set once at startup
  // For simplicity, this example doesn't dynamically update the exported constants.
  // A more robust solution might use a reactive store or context.
  console.warn("Platform set, but isMac/isWindows/isLinux constants are not reactive to this change.");
}
