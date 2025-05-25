<script setup lang="ts">
import { Space } from "ant-design-vue";
import { onMounted, ref } from "vue";

import ProList from "@/components/pro-list/index.vue";
import ProListItem from "@/components/pro-list-item/index.vue";
import { isMac } from "@/utils/platform"; // Assuming this util will be copied

const authorized = ref(false);

onMounted(async () => {
  if (!isMac) return;

  // TODO: 实现 Electron macOS 权限检查
  console.log("macOS 权限检查功能待实现");
  authorized.value = false;
});

function handleRequestPermission() {
  if (!isMac) return;
  // TODO: 实现 Electron macOS 权限请求
  console.log("macOS 权限请求功能待实现");
}
</script>

<template>
  <ProList v-if="isMac" title="权限设置">
    <ProListItem description="开启输入监控权限，以便接收系统的键盘和鼠标事件来响应你的操作。" title="输入监控权限">
      <Space v-if="authorized" class="text-success font-bold" :size="4">
        <div class="i-solar:verified-check-bold text-4.5" />
        <span>已授权</span>
      </Space>
      <Space v-else class="text-danger cursor-pointer font-bold" :size="4" @click="handleRequestPermission">
        <div class="i-solar:round-arrow-right-bold text-4.5" />
        <span>去授权</span>
      </Space>
    </ProListItem>
  </ProList>
</template>
