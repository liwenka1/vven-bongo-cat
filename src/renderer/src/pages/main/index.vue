<script setup lang="ts">
import { useDebounceFn, useEventListener } from "@vueuse/core";
import { onMounted, onUnmounted, ref, watch } from "vue";

import { useDevice } from "@/composables/useDevice";
import { useModel } from "@/composables/useModel";
import { useSharedMenu } from "@/composables/useSharedMenu";
import { hideWindow, showWindow } from "@/plugins/window";
import { useCatStore, type CatMode } from "@/stores/cat";

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
const { getSharedMenu } = useSharedMenu();
const catStore = useCatStore();

const resizing = ref(false);

onMounted(() => {
  console.log("Main page mounted, setting up event listeners...");
  handleLoad();

  // Listen for menu actions
  window.electron?.on("menu:action", (action: string, data?: unknown) => {
    handleMenuAction(action, data);
  });

  // 添加全局事件监听器来确保捕获右键事件
  document.addEventListener(
    "contextmenu",
    (e) => {
      e.preventDefault();
      handleContextmenu(e as MouseEvent);
    },
    true
  );

  document.addEventListener(
    "mousedown",
    (e) => {
      if (e.button === 2) {
        // 右键
        e.preventDefault();
        handleRightClick(e as MouseEvent);
      }
    },
    true
  );
});

onUnmounted(() => {
  handleDestroy();

  // Clean up menu action listener
  window.electron?.off("menu:action", () => {});
});

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
    window.electron?.setIgnoreMouse?.(value);
  },
  { immediate: true }
);

function handleWindowDrag() {
  window.electron?.startDragging?.();
}

function handleRightClick(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  // 延迟一点调用contextmenu处理，确保mousedown事件完成
  setTimeout(() => {
    handleContextmenu(event);
  }, 10);
}

async function handleContextmenu(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  // 检查Electron API是否可用
  if (!window.electron?.showContextMenu) {
    console.error("❌ showContextMenu method not available!");
    return;
  }

  try {
    // 使用完整的共享菜单
    const menuTemplate = await getSharedMenu();
    await window.electron.showContextMenu(menuTemplate);
  } catch (error) {
    console.error("❌ Failed to show context menu:", error);
  }
}

function resolveImageURL(key: string) {
  return `/keys/${key}.png`;
}

// Handle menu actions
function handleMenuAction(action: string, data?: unknown) {
  console.log("Processing menu action:", action, data);
  switch (action) {
    case "showPreference":
      console.log("Opening preferences...");
      showWindow("preference");
      break;
    case "hideMain":
      hideWindow("main");
      break;
    case "showMain":
      showWindow("main");
      break;
    case "setMode":
      if (typeof data === "string") {
        catStore.setMode(data as CatMode);
      }
      break;
    case "togglePenetrable":
      catStore.setPenetrable(!catStore.penetrable);
      break;
    case "setScale":
      if (typeof data === "number") {
        catStore.setScale(data);
      }
      break;
    case "setOpacity":
      if (typeof data === "number") {
        catStore.setOpacity(data);
      }
      break;
    default:
      console.warn("Unknown menu action:", action);
  }
}
</script>

<template>
  <div
    class="size-screen relative overflow-hidden"
    :class="[catStore.mirrorMode ? '-scale-x-100' : 'scale-x-100']"
    :style="{ opacity: catStore.opacity / 100 }"
  >
    <!-- 背景图片 - 纯显示，不处理事件 -->
    <img :src="backgroundImagePath" class="pointer-events-none h-full w-full object-cover" />

    <!-- 拖拽层 - 处理窗口拖拽 -->
    <div
      class="absolute inset-0 bg-transparent"
      style="-webkit-app-region: drag; pointer-events: auto; z-index: 1"
      @mousedown.left="handleWindowDrag"
    ></div>

    <!-- 右键检测层 - 处理右键事件 -->
    <div
      class="absolute inset-0 bg-transparent"
      style="-webkit-app-region: no-drag; pointer-events: auto; z-index: 2"
      @contextmenu.prevent.stop="handleContextmenu"
      @mousedown.right.prevent.stop="handleRightClick"
    ></div>

    <!-- Live2D Canvas -->
    <canvas id="live2dCanvas" class="pointer-events-none absolute top-0 left-0 h-full w-full" style="z-index: 10" />

    <!-- 按键显示层 -->
    <div class="pointer-events-none absolute inset-0" style="z-index: 20">
      <img
        v-for="key in pressedKeys"
        :key="key"
        :src="resolveImageURL(key)"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform object-contain"
      />
    </div>

    <!-- 重绘提示 -->
    <div v-show="resizing" class="absolute inset-0 flex items-center justify-center bg-black" style="z-index: 40">
      <span class="text-center text-5xl text-white"> 重绘中... </span>
    </div>
  </div>
</template>

<style scoped></style>
