<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { isString } from "es-toolkit";
import isURL from "is-url";
import { onMounted } from "vue";
import { RouterView } from "vue-router";

import { useAppListen } from "./composables/useElectronListen";
import { useThemeVars } from "./composables/useThemeVars";
import { useWindowState } from "./composables/useWindowState";
import { LISTEN_KEY } from "./constants";
import { hideWindow, showWindow } from "./plugins/window";
import { useAppStore } from "./stores/app";
import { useCatStore } from "./stores/cat";
import { useGeneralStore } from "./stores/general";
import { useModelStore } from "./stores/model";

const { generateColorVars } = useThemeVars();
const appStore = useAppStore();
const modelStore = useModelStore();
const catStore = useCatStore();
const generalStore = useGeneralStore();
const { restoreState } = useWindowState();

onMounted(async () => {
  generateColorVars();

  // 初始化 stores
  if (appStore.$electron) await appStore.$electron.init();
  if (modelStore.$electron) await modelStore.$electron.init();
  if (catStore.$electron) await catStore.$electron.init();
  if (generalStore.$electron) await generalStore.$electron.init();

  // 恢复窗口状态
  await restoreState();
});

// 监听窗口显示/隐藏事件
useAppListen(LISTEN_KEY.SHOW_WINDOW, () => {
  showWindow();
});

useAppListen(LISTEN_KEY.HIDE_WINDOW, () => {
  hideWindow();
});

// 错误处理
useEventListener("unhandledrejection", ({ reason }) => {
  const message = isString(reason) ? reason : JSON.stringify(reason);
  console.error("Unhandled Rejection:", message);
});

// 处理外部链接
useEventListener("click", (event) => {
  const link = (event.target as HTMLElement).closest("a");
  if (!link) return;
  const { href, target } = link;
  if (target === "_blank") return;
  event.preventDefault();
  if (!isURL(href)) return;

  window.electron?.openExternal(href);
});
</script>

<template>
  <RouterView />
</template>
