// import { invoke } from '@tauri-apps/api/core' // TAURI-SPECIFIC
// import { emit } from '@tauri-apps/api/event' // TAURI-SPECIFIC

// import { LISTEN_KEY } from '../constants' // Constants are available

// For Electron, these functions will typically use ipcRenderer to communicate with the main process.

type WindowLabel = "main" | "preference"; // This type can remain useful

// const COMMAND = { // Tauri specific commands
//   SHOW_WINDOW: 'plugin:custom-window|show_window',
//   HIDE_WINDOW: 'plugin:custom-window|hide_window',
// }

export function showWindow(label?: WindowLabel) {
  if (window.electron?.showWindow) {
    window.electron.showWindow();
  }
}

export function hideWindow(label?: WindowLabel) {
  if (window.electron?.hideWindow) {
    window.electron.hideWindow();
  }
}
