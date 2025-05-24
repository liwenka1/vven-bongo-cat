<script setup lang="ts">
import { Flex } from "ant-design-vue";
import { onMounted, ref } from "vue";

import About from "./components/about/index.vue";
import Cat from "./components/cat/index.vue";
import General from "./components/general/index.vue";
import Model from "./components/model/index.vue";

import UpdateApp from "@/components/update-app/index.vue";
// import { useTray } from '@/composables/useTray' // TAURI-SPECIFIC - Needs Electron equivalent for tray
import { useAppStore } from "@/stores/app";
import { isMac } from "@/utils/platform"; // Assuming this util will be copied

// const { createTray } = useTray() // TAURI-SPECIFIC
const appStore = useAppStore();
const current = ref(0);

onMounted(async () => {
  // createTray() // TAURI-SPECIFIC
  console.warn("TODO: Implement createTray for Electron");
});

const menus = [
  {
    label: "猫咪设置",
    icon: "i-solar:cat-bold",
    component: Cat
  },
  {
    label: "通用设置",
    icon: "i-solar:settings-minimalistic-bold",
    component: General
  },
  {
    label: "模型管理",
    icon: "i-solar:magic-stick-3-bold",
    component: Model
  },
  {
    label: "关于",
    icon: "i-solar:info-circle-bold",
    component: About
  }
];
</script>

<template>
  <Flex class="h-screen">
    <div
      class="bg-gradient-from-primary-1 bg-gradient-to-black/1 bg-gradient-linear flex h-full w-30 flex-col items-center gap-4"
      :class="[isMac ? 'pt-8' : 'pt-4']"
      style="-webkit-app-region: drag"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="b b-color-2 b-solid rounded-2xl">
          <img class="size-15" src="/images/logo.png" />
        </div>

        <span class="font-bold">{{ appStore.name }}</span>
      </div>

      <div class="flex flex-col gap-2">
        <div
          v-for="(item, index) in menus"
          :key="item.label"
          class="hover:bg-color-7 text-color-3 flex size-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg transition"
          :class="{ 'text-primary-5 bg-white! font-bold': current === index }"
          @mousedown="current = index"
        >
          <div class="size-8" :class="item.icon" />

          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div
      v-for="(item, index) in menus"
      v-show="current === index"
      :key="item.label"
      class="bg-color-8 flex-1 overflow-auto p-4"
      style="-webkit-app-region: drag"
    >
      <component :is="item.component" />
    </div>
  </Flex>

  <UpdateApp />
</template>
