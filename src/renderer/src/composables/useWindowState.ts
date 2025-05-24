import { isNumber } from "es-toolkit/compat";
import { onMounted, ref } from "vue";
import { useAppStore } from "../stores/app";

interface ElectronPosition {
  x: number;
  y: number;
}

interface ElectronSize {
  width: number;
  height: number;
}

export type WindowState = Record<string, Partial<ElectronPosition & ElectronSize> | undefined>;

export function useWindowState() {
  const appStore = useAppStore();
  const isRestored = ref(false);
  const windowLabel = "main";

  onMounted(() => {
    // 监听窗口状态变化
    window.electron?.on("window-state-changed", (...args: unknown[]) => {
      const state = args[0] as Partial<ElectronPosition & ElectronSize>;
      onChange(state);
    });
  });

  const onChange = async (payload: Partial<ElectronPosition & ElectronSize>) => {
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

    if (isNumber(x) && isNumber(y)) {
      // 设置窗口位置
      await window.electron?.setWindowPosition(x, y);
    }

    if (width && height) {
      // 设置窗口大小
      await window.electron?.setWindowSize(width, height);
    }

    isRestored.value = true;
  };

  return {
    isRestored,
    restoreState,
    onChange
  };
}
