import { round } from "es-toolkit";
import { computed, watch } from "vue";

// import { LogicalSize, PhysicalSize } from '@tauri-apps/api/dpi' // TAURI-SPECIFIC
// import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow' // TAURI-SPECIFIC

import live2d from "../utils/live2d"; // Assuming this util will be copied
import { getCursorMonitor } from "../utils/monitor"; // Assuming this util will be copied

// import { useTauriListen } from './useTauriListen' // TAURI-SPECIFIC - replace with Electron IPC

import { LISTEN_KEY } from "@/constants"; // Assuming constants will be copied
import { useCatStore } from "@/stores/cat";
import { useModelStore } from "@/stores/model";
import { getImageSize } from "@/utils/dom"; // Assuming this util will be copied

// const appWindow = getCurrentWebviewWindow() // TAURI-SPECIFIC - Get BrowserWindow instance via IPC if needed

export function useModel() {
  const catStore = useCatStore();
  const modelStore = useModelStore();

  watch(() => catStore.mode, handleLoad);

  const backgroundImagePath = computed(() => {
    return `/backgrounds/${catStore.mode}.png`;
  });

  watch(
    () => catStore.scale,
    async () => {
      try {
        const { width, height } = await getImageSize(backgroundImagePath.value);
        const newWidth = round(width * (catStore.scale / 100));
        const newHeight = round(height * (catStore.scale / 100));
        if (window.electron?.setWindowSize) {
          await window.electron.setWindowSize(newWidth, newHeight);
        }
      } catch (error) {
        console.error("Error in scale watcher:", error);
      }
    },
    { immediate: true }
  );

  // TODO: Implement Electron IPC for LISTEN_KEY.PLAY_EXPRESSION
  // Example:
  // if (window.electronAPI && window.electronAPI.onPlayExpression) {
  //   window.electronAPI.onPlayExpression((payload: number) => {
  //     live2d.playExpressions(payload)
  //   });
  // }
  console.warn("TODO: Implement Electron IPC for LISTEN_KEY.PLAY_EXPRESSION in useModel.ts");

  async function handleLoad() {
    try {
      console.log("Loading model:", `/models/${catStore.mode}/cat.model3.json`);
      const data = await live2d.load(`/models/${catStore.mode}/cat.model3.json`);
      console.log("Model loaded successfully:", data);
      await handleResize();
      Object.assign(modelStore, data);
    } catch (error) {
      console.error("Failed to load Live2D model:", error);
    }
  }

  function handleDestroy() {
    try {
      live2d.destroy();
    } catch (error) {
      console.error("Error in handleDestroy:", error);
    }
  }

  async function handleResize() {
    try {
      if (!live2d.model) {
        console.warn("No Live2D model available for resize");
        return;
      }

      const { innerWidth, innerHeight } = window;
      const { width, height } = await getImageSize(backgroundImagePath.value);

      // 设置模型缩放
      const scale = innerWidth / width;
      live2d.model.scale.set(scale);

      // 设置模型位置
      live2d.model.position.set(innerWidth / 2, innerHeight);

      if (round(innerWidth / innerHeight, 1) !== round(width / height, 1)) {
        const newWindowWidth = innerWidth;
        const newWindowHeight = Math.ceil(innerWidth * (height / width));
        if (window.electron?.setWindowSize) {
          await window.electron.setWindowSize(newWindowWidth, newWindowHeight);
        }
      }

      let currentWindowSize = { width: window.innerWidth, height: window.innerHeight };
      if (window.electron?.getWindowSize) {
        const [width, height] = await window.electron.getWindowSize();
        currentWindowSize = { width, height };
      }

      catStore.scale = round((currentWindowSize.width / width) * 100);
    } catch (error) {
      console.error("Error in handleResize:", error);
    }
  }

  function handleKeyDown(value: string[]) {
    try {
      const hasArrowKey = value.some((key) => key.endsWith("Arrow"));
      const hasNonArrowKey = value.some((key) => !key.endsWith("Arrow"));

      live2d.setParameterValue("CatParamRightHandDown", hasArrowKey);
      live2d.setParameterValue("CatParamLeftHandDown", hasNonArrowKey);
    } catch (error) {
      console.error("Error in handleKeyDown:", error);
    }
  }

  async function handleMouseMove() {
    try {
      if (catStore.mode !== "standard" || !live2d.model) {
        console.debug("Mouse move ignored: mode is not standard or model not loaded", {
          mode: catStore.mode,
          modelLoaded: !!live2d.model
        });
        return;
      }

      const monitor = await getCursorMonitor();
      if (!monitor) {
        console.warn("No monitor information available - check if electron.getCursorMonitor is working");
        return;
      }

      const { size, position, cursorPosition } = monitor;

      console.debug("Monitor info received:", {
        size,
        position,
        cursorPosition
      });

      const xRatio = (cursorPosition.x - position.x) / size.width;
      const yRatio = (cursorPosition.y - position.y) / size.height;

      // 将比例转换为 -30 到 30 的范围
      const x = xRatio * 60 - 30;
      const y = yRatio * 60 - 30;

      console.debug("Calculated parameters:", {
        xRatio,
        yRatio,
        x,
        y
      });

      // 头部和眼睛的参数
      live2d.setParameterValue("PARAM_ANGLE_X", x);
      live2d.setParameterValue("PARAM_ANGLE_Y", -y);
      live2d.setParameterValue("PARAM_EYE_BALL_X", x);
      live2d.setParameterValue("PARAM_EYE_BALL_Y", -y);
      live2d.setParameterValue("PARAM_BODY_ANGLE_X", x * 0.5);

      // 猫咪特有的参数
      live2d.setParameterValue("ParamCatTailSwayX", x * 0.5);
      live2d.setParameterValue("ParamCatTailSwayY", -y * 0.5);
      live2d.setParameterValue("ParamCatEarL", Math.abs(x) * 0.5);
      live2d.setParameterValue("ParamCatEarR", Math.abs(x) * 0.5);
    } catch (error) {
      console.error("Error in handleMouseMove:", error);
    }
  }

  function handleMouseDown(value: string[]) {
    try {
      const hasLeftDown = value.includes("Left");
      const hasRightDown = value.includes("Right");

      live2d.setParameterValue("ParamMouseLeftDown", hasLeftDown);
      live2d.setParameterValue("ParamMouseRightDown", hasRightDown);
    } catch (error) {
      console.error("Error in handleMouseDown:", error);
    }
  }

  return {
    backgroundImagePath,
    handleLoad,
    handleDestroy,
    handleResize,
    handleKeyDown,
    handleMouseMove,
    handleMouseDown
  };
}
