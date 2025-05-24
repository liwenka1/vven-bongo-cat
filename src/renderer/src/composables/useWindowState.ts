import type { Event } from "@tauri-apps/api/event"; // TAURI-SPECIFIC - Electron events are different

// import { PhysicalPosition, PhysicalSize } from '@tauri-apps/api/dpi' // TAURI-SPECIFIC
// import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow' // TAURI-SPECIFIC
// import { availableMonitors } from '@tauri-apps/api/window' // TAURI-SPECIFIC
import { isNumber } from "es-toolkit/compat"; // Assuming es-toolkit is installed
import { onMounted, ref } from "vue";

import { useAppStore } from "@/stores/app"; // Assuming stores will be copied

// Define equivalent types for Electron if needed, or use simple objects
interface ElectronPosition {
  x: number;
  y: number;
}
interface ElectronSize {
  width: number;
  height: number;
}
export type WindowState = Record<string, Partial<ElectronPosition & ElectronSize> | undefined>;

// const appWindow = getCurrentWebviewWindow() // TAURI-SPECIFIC
// const { label } = appWindow // TAURI-SPECIFIC - Window identification in Electron might be different (e.g. by ID)

// For Electron, window state management often involves the main process and possibly a store like electron-store.
// This composable would need to communicate via IPC.

export function useWindowState() {
  const appStore = useAppStore();
  const isRestored = ref(false);
  const windowLabel = "main"; // Placeholder for current window identifier

  onMounted(() => {
    // appWindow.onMoved(onChange) // TAURI-SPECIFIC
    // appWindow.onResized(onChange) // TAURI-SPECIFIC
    // TODO: Setup Electron window move/resize listeners via IPC from main process
    // Main process would listen to BrowserWindow 'move' and 'resize' events
    // and send updated position/size to renderer via IPC.
    console.warn("TODO: Setup Electron window move/resize listeners in useWindowState.ts");

    // Example IPC listener (would need a corresponding sender in main.js)
    // if (window.electronAPI && window.electronAPI.onWindowStateChanged) {
    //   window.electronAPI.onWindowStateChanged((newState: {x?: number, y?: number, width?: number, height?: number}) => {
    //     if (appStore.windowState[windowLabel]) {
    //        Object.assign(appStore.windowState[windowLabel], newState);
    //     } else {
    //        appStore.windowState[windowLabel] = newState;
    //     }
    //   });
    // }
  });

  // This onChange would be triggered by an IPC event from the main process in Electron
  const onChange = async (payload: Partial<ElectronPosition & ElectronSize>) => {
    // const minimized = await appWindow.isMinimized() // TAURI-SPECIFIC
    // TODO: Get minimized state if needed, possibly via IPC call
    // if (minimized) return

    appStore.windowState[windowLabel] ??= {};
    Object.assign(appStore.windowState[windowLabel]!, payload);
  };

  const restoreState = async () => {
    const state = appStore.windowState[windowLabel];
    if (!state) {
      isRestored.value = true;
      return;
    }
    const { x, y, width, height } = state;

    // TODO: In Electron, positioning and sizing are done in the main process.
    // Renderer would send an IPC message to the main process to restore state.
    // Main process would then validate against available monitors.
    console.warn("TODO: Implement restoreState for Electron via IPC to main process", { x, y, width, height });

    // Simplified logic for placeholder:
    if (isNumber(x) && isNumber(y)) {
      // Call IPC to set position
      // Example: window.electronAPI?.setWindowPosition({ x, y });
    }
    if (width && height) {
      // Call IPC to set size
      // Example: window.electronAPI?.setWindowSize({ width, height });
    }

    isRestored.value = true;
  };

  return {
    isRestored,
    restoreState,
    onChange // Expose onChange if it will be called by IPC listeners set up elsewhere
  };
}
