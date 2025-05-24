import { defineStore } from "pinia";
import { ref } from "vue";

interface Motion {
  Name: string;
  File: string;
  Sound?: string;
  FadeInTime: number;
  FadeOutTime: number;
  Description?: string;
}

type MotionGroup = Record<string, Motion[]>;

interface Expression {
  Name: string;
  File: string;
  Description?: string;
}

export const useModelStore = defineStore("model", () => {
  const motions = ref<MotionGroup>({});
  const expressions = ref<Expression[]>([]);

  async function init() {
    if (window.electron) {
      // 如果需要从主进程获取模型数据，可以在这里添加
      // const modelData = await window.electron.getModelData();
      // motions.value = modelData.motions;
      // expressions.value = modelData.expressions;
    }
  }

  return {
    motions,
    expressions,
    init
  };
});
