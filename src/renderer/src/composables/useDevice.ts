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
  Control: "Control",
  Alt: "Alt",
  Shift: "Shift",
  Enter: "Return",
  Backspace: "Backspace",
  Tab: "Tab",
  CapsLock: "CapsLock",
  Escape: "Escape",
  ArrowLeft: "LeftArrow",
  ArrowRight: "RightArrow",
  ArrowUp: "UpArrow",
  ArrowDown: "DownArrow",
  Delete: "Delete",
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
    console.log("Handling press:", value);

    if (catStore.singleMode) {
      array.value = array.value.filter((item) => {
        return item.endsWith("Arrow") !== value.endsWith("Arrow");
      });
    }

    array.value = uniq(array.value.concat(value));
    console.log("Updated array:", array.value);
  };

  const handleRelease = (array: Ref<string[]>, value?: string) => {
    if (!value) return;
    console.log("Handling release:", value);

    array.value = array.value.filter((item) => item !== value);
    console.log("Updated array:", array.value);
  };

  const normalizeKeyValue = (key: string) => {
    console.log("Normalizing key:", key);

    // 先尝试直接映射
    const mappedKey = keyMap[key.toLowerCase()];
    if (mappedKey) {
      console.log("Mapped key:", mappedKey);
      return mappedKey;
    }

    // 如果没有映射，尝试特殊处理
    key = key.replace(/^(Meta).*/, "$1").replace(/F(\d+)/, "Fn");

    const isInvalidArrowKey = key.endsWith("Arrow") && catStore.mode !== "keyboard";
    const isUnsupportedKey = !supportKeys.includes(key);

    if (isInvalidArrowKey || isUnsupportedKey) {
      console.log("Key not supported or invalid:", key);
      return;
    }

    console.log("Normalized key:", key);
    return key;
  };

  // 添加键盘事件监听
  useEventListener(window, "keydown", (event: globalThis.KeyboardEvent) => {
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

  // 添加鼠标事件监听
  useEventListener(window, "mousedown", (event: globalThis.MouseEvent) => {
    const button = event.button === 0 ? "Left" : event.button === 2 ? "Right" : null;
    console.debug("Mouse down event:", { button, event });
    if (button) {
      handlePress(pressedMouses, button);
    }
  });

  useEventListener(window, "mouseup", (event: globalThis.MouseEvent) => {
    const button = event.button === 0 ? "Left" : event.button === 2 ? "Right" : null;
    console.debug("Mouse up event:", { button, event });
    if (button) {
      handleRelease(pressedMouses, button);
    }
  });

  useEventListener(window, "mousemove", (event: globalThis.MouseEvent) => {
    console.debug("Mouse move event:", { x: event.clientX, y: event.clientY });
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  });

  // 当窗口失去焦点时，清除所有按键状态
  useEventListener(window, "blur", () => {
    pressedKeys.value = [];
    pressedMouses.value = [];
  });

  return {
    pressedMouses,
    mousePosition,
    pressedKeys
  };
}
