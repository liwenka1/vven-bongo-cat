<script setup lang="ts">
// import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow' // TAURI-SPECIFIC
// import { message } from '@tauri-apps/plugin-dialog' // TAURI-SPECIFIC
import { Space } from "ant-design-vue";
// import { checkInputMonitoringPermission, requestInputMonitoringPermission } from 'tauri-plugin-macos-permissions-api' // TAURI-SPECIFIC
import { onMounted, ref } from "vue";

import ProList from "@/components/pro-list/index.vue";
import ProListItem from "@/components/pro-list-item/index.vue";
import { isMac } from "@/utils/platform"; // Assuming this util will be copied

const authorized = ref(false);

onMounted(async () => {
  if (!isMac) return; // Only run on macOS
  // authorized.value = await checkInputMonitoringPermission() // TAURI-SPECIFIC
  console.warn("TODO: Implement checkInputMonitoringPermission for Electron on macOS");
  authorized.value = false; // Placeholder

  if (authorized.value) return;

  // const appWindow = getCurrentWebviewWindow() // TAURI-SPECIFIC
  // await appWindow.setAlwaysOnTop(true) // TAURI-SPECIFIC

  // await message('如果权限已开启，先选中后点击"-"按钮将其删除，再重新手动添加，并重启应用以确保权限生效。', { // TAURI-SPECIFIC
  //   title: '输入监控权限',
  //   okLabel: '前往开启',
  //   kind: 'warning',
  // })
  console.warn("TODO: Implement permission request dialog for Electron on macOS");

  // await appWindow.setAlwaysOnTop(false) // TAURI-SPECIFIC
  // requestInputMonitoringPermission() // TAURI-SPECIFIC
  console.warn("TODO: Implement requestInputMonitoringPermission for Electron on macOS");
});

function handleRequestPermission() {
  if (!isMac) return;
  // requestInputMonitoringPermission() // TAURI-SPECIFIC
  console.warn("TODO: Implement requestInputMonitoringPermission for Electron on macOS");
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
