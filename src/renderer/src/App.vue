<script setup lang="ts">
// import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow' // TAURI-SPECIFIC
// import { error as logError } from '@tauri-apps/plugin-log' // TAURI-SPECIFIC - Use console.error or custom Electron logger
// import { openUrl } from '@tauri-apps/plugin-opener' // TAURI-SPECIFIC - Use Electron's shell.openExternal

import { useEventListener } from "@vueuse/core";
import { isString } from "es-toolkit";
import isURL from "is-url";
import { onMounted, ref } from "vue";
import { RouterView } from "vue-router";

// import { useTauriListen } from './composables/useTauriListen' // Using adapted useAppListen
import { useAppListen } from "./composables/useTauriListen"; // Use adapted version
import { useThemeVars } from "./composables/useThemeVars";
import { useWindowState } from "./composables/useWindowState"; // Adapted version
import { LISTEN_KEY } from "./constants";
import { hideWindow, showWindow } from "./plugins/window"; // Adapted version
import { useAppStore } from "./stores/app";
import { useCatStore } from "./stores/cat";
import { useGeneralStore } from "./stores/general";
import { useModelStore } from "./stores/model";

const { generateColorVars } = useThemeVars();
const appStore = useAppStore();
const modelStore = useModelStore();
const catStore = useCatStore();
const generalStore = useGeneralStore();
// const appWindow = getCurrentWebviewWindow() // TAURI-SPECIFIC
const { isRestored, restoreState } = useWindowState();

// Bring in a simplified version of isRestored for testing
const isRestoredForTest = ref(false);
onMounted(() => {
  console.log("App.vue onMounted - forcing isRestoredForTest to true for debugging");
  isRestoredForTest.value = true;
});

onMounted(async () => {
  generateColorVars();

  // Initialize stores with Electron-specific logic
  // These will be implemented in the store files
  await appStore.$electron?.init();
  await modelStore.$electron?.init();
  await catStore.$electron?.init();
  await generalStore.$electron?.init();

  // The .$tauri.start() methods are custom to BongoCat's Tauri setup.
  // We need an Electron equivalent if these stores require async initialization (e.g., loading from disk via IPC).
  // await appStore.$tauri.start()
  // await modelStore.$tauri.start()
  // await catStore.$tauri.start()
  // await generalStore.$tauri.start()
  console.warn("TODO: Implement store initialization logic if needed for Electron in App.vue");

  // restoreState(); // Let's not call the original restoreState for this test
  isRestoredForTest.value = true; // Explicitly set for testing RouterView
  console.log("App.vue onMounted: isRestoredForTest set to true");
});

// Adapt LISTEN_KEY.SHOW_WINDOW and HIDE_WINDOW for Electron
useAppListen<string>(LISTEN_KEY.SHOW_WINDOW, () => {
  showWindow();
});

useAppListen<string>(LISTEN_KEY.HIDE_WINDOW, () => {
  hideWindow();
});

useEventListener("unhandledrejection", ({ reason }) => {
  const message = isString(reason) ? reason : JSON.stringify(reason);
  // logError(message) // TAURI-SPECIFIC
  console.error("Unhandled Rejection:", message);
});

useEventListener("click", (event) => {
  const link = (event.target as HTMLElement).closest("a");
  if (!link) return;
  const { href, target } = link;
  if (target === "_blank") return; // Let browser handle _blank
  event.preventDefault();
  if (!isURL(href)) return;

  // Use Electron's shell.openExternal via IPC
  window.electron?.openExternal(href);
});
</script>

<template>
  <RouterView />
</template>
