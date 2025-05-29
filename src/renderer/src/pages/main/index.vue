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

// 拖拽相关状态
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const windowStart = ref({ x: 0, y: 0 });

onMounted(() => {
  console.log("Main page mounted, setting up event listeners...");
  handleLoad();

  // Listen for menu actions
  window.electron?.on("menu:action", (...args: unknown[]) => {
    const action = args[0] as string;
    const data = args[1] as unknown;
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

  // 添加全局鼠标移动和释放事件监听
  document.addEventListener("mousemove", handleDragMove, true);
  document.addEventListener("mouseup", handleDragEnd, true);
});

onUnmounted(() => {
  handleDestroy();

  // Clean up menu action listener
  window.electron?.off("menu:action", () => {});

  // 清理全局事件监听器
  document.removeEventListener("mousemove", handleDragMove, true);
  document.removeEventListener("mouseup", handleDragEnd, true);
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

// 拖拽功能实现
async function handleWindowMouseDown(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();

  if (event.button === 0) {
    // 左键 - 开始拖拽
    isDragging.value = true;
    dragStart.value = { x: event.screenX, y: event.screenY };

    // 获取当前窗口位置
    try {
      const position = await window.electron?.getWindowPosition?.();
      if (position && Array.isArray(position)) {
        windowStart.value = {
          x: position[0],
          y: position[1]
        };
      }
    } catch (error) {
      console.error("Failed to get window position:", error);
    }
  } else if (event.button === 2) {
    // 右键 - 显示菜单
    setTimeout(() => {
      handleContextmenu(event);
    }, 10);
  }
}

function handleDragMove(event: MouseEvent) {
  if (!isDragging.value) return;

  event.preventDefault();
  event.stopPropagation();

  const deltaX = event.screenX - dragStart.value.x;
  const deltaY = event.screenY - dragStart.value.y;

  const newX = windowStart.value.x + deltaX;
  const newY = windowStart.value.y + deltaY;

  // 移动窗口
  window.electron?.setWindowPosition?.(newX, newY);
}

function handleDragEnd(event: MouseEvent) {
  if (event.button !== 0) return; // 只处理左键

  event.preventDefault();
  event.stopPropagation();

  isDragging.value = false;
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

    <!-- 拖拽和交互层 - 统一处理所有鼠标事件 -->
    <div
      class="absolute inset-0 bg-transparent"
      style="pointer-events: auto; z-index: 1"
      @mousedown="handleWindowMouseDown"
      @contextmenu.prevent.stop="handleContextmenu"
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
