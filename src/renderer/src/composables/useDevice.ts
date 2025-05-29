import type { Ref } from "vue";

import { useDebounceFn, useEventListener } from "@vueuse/core";
import { uniq } from "es-toolkit";
import { reactive, ref, watch } from "vue";

import { useCatStore } from "@/stores/cat";

interface MouseMoveValue {
  x: number;
  y: number;
}

function getSupportKeys() {
  const files = import.meta.glob("../../public/keys/*.png?url", { eager: true });

  return Object.keys(files)
    .map((path) => {
      const key = path.split("/").pop()?.replace(".png", "");
      console.log("Found key:", key);
      return key;
    })
    .filter(Boolean);
}

const supportKeys = getSupportKeys();
console.log("Supported keys:", supportKeys);

// 键名映射表
const keyMap: Record<string, string> = {
  a: "KeyA",
  b: "KeyB",
  c: "KeyC",
  d: "KeyD",
  e: "KeyE",
  f: "KeyF",
  g: "KeyG",
  h: "KeyH",
  i: "KeyI",
  j: "KeyJ",
  k: "KeyK",
  l: "KeyL",
  m: "KeyM",
  n: "KeyN",
  o: "KeyO",
  p: "KeyP",
  q: "KeyQ",
  r: "KeyR",
  s: "KeyS",
  t: "KeyT",
  u: "KeyU",
  v: "KeyV",
  w: "KeyW",
  x: "KeyX",
  y: "KeyY",
  z: "KeyZ",
  " ": "Space",
  space: "Space",
  // 修饰键映射（仅用于窗口内监听）
  Control: "Control",
  ctrl: "Control",
  Alt: "Alt",
  alt: "Alt",
  Shift: "Shift",
  shift: "Shift",
  Meta: "Meta",
  cmd: "Meta",
  // 功能键映射
  Enter: "Return",
  enter: "Return",
  Backspace: "Backspace",
  backspace: "Backspace",
  Tab: "Tab",
  tab: "Tab",
  CapsLock: "CapsLock",
  Escape: "Escape",
  escape: "Escape",
  ArrowLeft: "LeftArrow",
  left: "LeftArrow",
  ArrowRight: "RightArrow",
  right: "RightArrow",
  ArrowUp: "UpArrow",
  up: "UpArrow",
  ArrowDown: "DownArrow",
  down: "DownArrow",
  Delete: "Delete",
  delete: "Delete",
  "`": "BackQuote",
  "/": "Slash",
  "0": "Num0",
  "1": "Num1",
  "2": "Num2",
  "3": "Num3",
  "4": "Num4",
  "5": "Num5",
  "6": "Num6",
  "7": "Num7",
  "8": "Num8",
  "9": "Num9"
};

export function useDevice() {
  const pressedMouses = ref<string[]>([]);
  const mousePosition = reactive<MouseMoveValue>({ x: 0, y: 0 });
  const pressedKeys = ref<string[]>([]);
  const catStore = useCatStore();

  // 监听状态 - 初始化为启用状态
  const globalListenerActive = ref(true);
  const usingGlobalListener = ref(false);

  // 初始化时获取后端监听状态
  if (window.electron?.global?.isListenerActive) {
    window.electron.global.isListenerActive().then((active) => {
      globalListenerActive.value = active;
    });
  }

  watch(
    () => catStore.mode,
    () => {
      pressedKeys.value = pressedKeys.value.filter((key) => !key.endsWith("Arrow"));
    }
  );

  const debounceCapsLockRelease = useDebounceFn(() => {
    handleRelease(pressedKeys, "CapsLock");
  }, 100);

  const handlePress = (array: Ref<string[]>, value?: string) => {
    if (!value) return;
    console.log("🎹 Key pressed:", value, usingGlobalListener.value ? "(global)" : "(window)");

    if (catStore.singleMode) {
      array.value = array.value.filter((item) => {
        return item.endsWith("Arrow") !== value.endsWith("Arrow");
      });
    }

    array.value = uniq(array.value.concat(value));
    console.log("🎹 Active keys:", array.value);
  };

  const handleRelease = (array: Ref<string[]>, value?: string) => {
    if (!value) return;
    console.log("🎹 Key released:", value, usingGlobalListener.value ? "(global)" : "(window)");

    array.value = array.value.filter((item) => item !== value);
    console.log("🎹 Active keys:", array.value);
  };

  const normalizeKeyValue = (key: string) => {
    console.log("🔄 Normalizing key:", key);

    // 先尝试直接映射
    const mappedKey = keyMap[key.toLowerCase()];
    if (mappedKey) {
      console.log("✅ Mapped key:", mappedKey);
      return mappedKey;
    }

    // 如果没有映射，尝试特殊处理
    key = key.replace(/^(Meta).*/, "$1").replace(/F(\d+)/, "Fn");

    const isInvalidArrowKey = key.endsWith("Arrow") && catStore.mode !== "keyboard";
    const isUnsupportedKey = !supportKeys.includes(key);

    if (isInvalidArrowKey || isUnsupportedKey) {
      console.log("❌ Key not supported or invalid:", key);
      return;
    }

    console.log("✅ Normalized key:", key);
    return key;
  };

  // 窗口内键盘事件监听
  useEventListener(window, "keydown", (event: globalThis.KeyboardEvent) => {
    usingGlobalListener.value = false; // 标记为窗口内监听
    const key = normalizeKeyValue(event.key);
    if (key === "CapsLock") {
      handlePress(pressedKeys, "CapsLock");
      debounceCapsLockRelease();
    }
    handlePress(pressedKeys, key);
  });

  useEventListener(window, "keyup", (event: globalThis.KeyboardEvent) => {
    const key = normalizeKeyValue(event.key);
    if (key !== "CapsLock") {
      handleRelease(pressedKeys, key);
    }
  });

  // 鼠标事件监听
  useEventListener(window, "mousedown", (event: globalThis.MouseEvent) => {
    const button = event.button === 0 ? "Left" : event.button === 2 ? "Right" : null;
    console.debug("🖱️ Mouse down:", button);
    if (button) {
      handlePress(pressedMouses, button);
    }
  });

  useEventListener(window, "mouseup", (event: globalThis.MouseEvent) => {
    const button = event.button === 0 ? "Left" : event.button === 2 ? "Right" : null;
    console.debug("🖱️ Mouse up:", button);
    if (button) {
      handleRelease(pressedMouses, button);
    }
  });

  useEventListener(window, "mousemove", (event: globalThis.MouseEvent) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  });

  // 当窗口失去焦点时，清除所有按键状态
  useEventListener(window, "blur", () => {
    console.log("🎯 Window lost focus - clearing key states");
    pressedKeys.value = [];
    pressedMouses.value = [];
    usingGlobalListener.value = false;
  });

  useEventListener(window, "focus", () => {
    console.log("🎯 Window gained focus");
    usingGlobalListener.value = false;
  });

  return {
    pressedMouses,
    mousePosition,
    pressedKeys,
    globalListenerActive,
    usingGlobalListener
  };
}
