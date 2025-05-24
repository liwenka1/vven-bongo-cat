import type { Cubism4InternalModel } from "pixi-live2d-display";

import { Live2DModel } from "pixi-live2d-display";
import { Application, Ticker } from "pixi.js";

// 确保 Live2D 和 CubismCore 都已加载
function checkRuntime(): boolean {
  // 检查 Live2D 运行时
  if (typeof window.Live2D === "undefined") {
    console.error("Live2D runtime is not loaded");
    return false;
  }
  console.log("Live2D runtime version:", window.Live2D.getVersionStr());

  // 检查 Cubism 运行时
  if (typeof window.Live2DCubismCore === "undefined") {
    console.error("Cubism 4 runtime is not loaded");
    return false;
  }
  console.log("Cubism runtime loaded:", !!window.Live2DCubismCore);

  return true;
}

// 使用 PIXI 的 Ticker 类型
Live2DModel.registerTicker(Ticker);

class Live2d {
  private app: Application | null = null;
  public model: Live2DModel | null = null;

  constructor() {
    console.log("Live2D class initialized");
    if (!checkRuntime()) {
      console.error("Live2D initialization failed: required runtime not found");
    }
  }

  private mount() {
    try {
      if (!checkRuntime()) {
        throw new Error("Live2D runtime not available");
      }

      console.log("Mounting Live2D canvas...");
      const view = document.getElementById("live2dCanvas") as HTMLCanvasElement;
      if (!view) {
        throw new Error("Live2D canvas element #live2dCanvas not found!");
      }

      this.app = new Application({
        view,
        resizeTo: window,
        backgroundAlpha: 0,
        autoDensity: true,
        resolution: devicePixelRatio,
        antialias: true
      });

      // 设置渲染器选项
      this.app.renderer.options.powerPreference = "high-performance";
      this.app.renderer.options.antialias = true;

      console.log("Live2D canvas mounted successfully");
    } catch (error) {
      console.error("Error mounting Live2D canvas:", error);
      throw error;
    }
  }

  public async load(url: string) {
    try {
      if (!checkRuntime()) {
        throw new Error("Live2D runtime not available");
      }

      console.log("Starting Live2D model load:", url);
      if (!this.app) {
        console.log("Application not mounted, mounting now...");
        this.mount();
        if (!this.app) {
          throw new Error("Live2D Application could not be mounted.");
        }
      }

      console.log("Loading model from URL:", url);
      const model = await Live2DModel.from(url);
      console.log("Model loaded successfully");

      if (this.app?.stage.children.length) {
        console.log("Removing existing children from stage");
        this.app.stage.removeChildren();
      }

      console.log("Adding model to stage");
      // @ts-ignore - Type mismatch is expected but the operation is safe
      this.app?.stage.addChild(model);

      // 设置模型属性
      model.anchor.set(0.5, 1.0); // 设置锚点到底部中心
      model.scale.set(0.5); // 初始缩放
      model.position.set(window.innerWidth / 2, window.innerHeight); // 初始位置

      const { definitions, expressionManager } = model.internalModel.motionManager;
      this.model = model;

      console.log("Model setup complete");
      return {
        motions: definitions,
        expressions: expressionManager?.definitions ?? []
      };
    } catch (error) {
      console.error("Error loading Live2D model:", error);
      return { motions: {}, expressions: [] };
    }
  }

  public destroy() {
    try {
      console.log("Destroying Live2D model and application");
      this.model?.destroy();
      this.app?.destroy(true, { children: true, texture: true });
      this.app = null;
      this.model = null;
      console.log("Cleanup complete");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }

  public playMotion(group: string, index: number) {
    try {
      if (!checkRuntime()) return null;
      return this.model?.motion(group, index);
    } catch (error) {
      console.error("Error playing motion:", error);
      return null;
    }
  }

  public playExpressions(index: number) {
    try {
      if (!checkRuntime()) return null;
      return this.model?.expression(index);
    } catch (error) {
      console.error("Error playing expression:", error);
      return null;
    }
  }

  public setParameterValue(id: string, value: number | boolean) {
    try {
      if (!this.model || !checkRuntime()) {
        console.warn("No model available or runtime not loaded");
        return;
      }
      const internalModel = this.model?.internalModel as Cubism4InternalModel;
      if (internalModel && internalModel.coreModel) {
        console.log("Setting parameter:", id, "to value:", value);
        const paramIndex = internalModel.coreModel.getParameterIndex(id);
        if (paramIndex === -1) {
          console.warn("Parameter not found:", id);
          return;
        }
        return internalModel.coreModel.setParameterValueByIndex(paramIndex, Number(value));
      } else {
        console.warn("Internal model or core model not available");
      }
    } catch (error) {
      console.error("Error setting parameter value:", error);
    }
    return undefined;
  }
}

const live2d = new Live2d();

export default live2d;
