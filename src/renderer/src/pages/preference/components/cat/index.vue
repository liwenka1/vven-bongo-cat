<script setup lang="ts">
import type { SelectProps } from "ant-design-vue";

import { Select, Slider, Switch } from "ant-design-vue";

import ProList from "@/components/pro-list/index.vue";
import ProListItem from "@/components/pro-list-item/index.vue";
import { useCatStore } from "@/stores/cat";

const catStore = useCatStore();

const modeList: SelectProps["options"] = [
  {
    label: "标准模式",
    value: "standard"
  },
  {
    label: "键盘模式",
    value: "keyboard"
  }
];

function scaleFormatter(value?: number) {
  return value === 100 ? "默认" : `${value}%`;
}

function opacityFormatter(value?: number) {
  return `${value}%`;
}
</script>

<template>
  <ProList title="模型设置">
    <ProListItem title="选择模式">
      <Select v-model:value="catStore.mode" :options="modeList" />
    </ProListItem>

    <ProListItem title="镜像模式">
      <Switch v-model:checked="catStore.mirrorMode" />
    </ProListItem>

    <ProListItem description="启用后，每只手只显示最后按下的一个按键" title="单键模式">
      <Switch v-model:checked="catStore.singleMode" />
    </ProListItem>
  </ProList>

  <ProList title="窗口设置">
    <ProListItem description="启用后，窗口不影响对其他应用程序的操作" title="窗口穿透">
      <Switch v-model:checked="catStore.penetrable" />
    </ProListItem>

    <ProListItem description="将鼠标移动到窗口边缘后，也可以拖动调整窗口尺寸" title="窗口尺寸" vertical>
      <Slider v-model:value="catStore.scale" class="m-0!" :max="150" :min="50" :tip-formatter="scaleFormatter" />
    </ProListItem>

    <ProListItem title="不透明度" vertical>
      <Slider v-model:value="catStore.opacity" class="m-0!" :tip-formatter="opacityFormatter" />
    </ProListItem>
  </ProList>
</template>
