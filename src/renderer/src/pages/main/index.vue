<script setup lang="ts">
// import { Menu } from '@tauri-apps/api/menu' // TAURI-SPECIFIC
// import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow' // TAURI-SPECIFIC
import { useDebounceFn, useEventListener } from "@vueuse/core";
import { onMounted, onUnmounted, ref, watch } from "vue";

import { useDevice } from "@/composables/useDevice";
import { useModel } from "@/composables/useModel";
import { useCatStore } from "@/stores/cat";

// const appWindow = getCurrentWebviewWindow() // TAURI-SPECIFIC
const { pressedMouses, mousePosition, pressedKeys } = useDevice();
const {
  backgroundImagePath,
  handleLoad,
  handleDestroy,
  handleResize,
  handleMouseDown,
  handleMouseMove,
  handleKeyDown
} = useModel();
const catStore = useCatStore();

const resizing = ref(false);

onMounted(handleLoad);

onUnmounted(handleDestroy);

const handleDebounceResize = useDebounceFn(async () => {
  await handleResize();

  resizing.value = false;
}, 100);

useEventListener("resize", () => {
  resizing.value = true;

  handleDebounceResize();
});

watch(pressedMouses, handleMouseDown);

watch(mousePosition, handleMouseMove);

watch(pressedKeys, handleKeyDown);

watch(
  () => catStore.penetrable,
  (value) => {
    if (window.electron?.setIgnoreCursorEvents) {
      window.electron.setIgnoreCursorEvents(value);
    }
  },
  { immediate: true }
);

function handleWindowDrag() {
  // appWindow.startDragging() // TAURI-SPECIFIC - needs Electron equivalent
  console.warn("TODO: Implement startDragging for Electron");
}

async function handleContextmenu(event: MouseEvent) {
  event.preventDefault();
  // const menu = await Menu.new({ // TAURI-SPECIFIC
  //   items: await getSharedMenu(),
  // })
  // menu.popup()
}

function resolveImageURL(key: string) {
  console.log("Loading key image:", key);
  return `/keys/${key}.png`;
}
</script>

<template>
  <div
    class="size-screen children:(absolute size-full) relative overflow-hidden"
    :class="[catStore.mirrorMode ? '-scale-x-100' : 'scale-x-100']"
    style="-webkit-app-region: drag"
    :style="{ opacity: catStore.opacity / 100 }"
    @contextmenu="handleContextmenu"
    @mousedown="handleWindowDrag"
  >
    <img :src="backgroundImagePath" class="h-full w-full object-cover" />

    <canvas id="live2dCanvas" class="absolute top-0 left-0 h-full w-full" />

    <div class="pointer-events-none absolute inset-0">
      <img
        v-for="key in pressedKeys"
        :key="key"
        :src="resolveImageURL(key)"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform object-contain"
      />
    </div>

    <div v-show="resizing" class="flex items-center justify-center bg-black">
      <span class="text-center text-5xl text-white"> 重绘中... </span>
    </div>
  </div>
</template>

<style scoped></style>
