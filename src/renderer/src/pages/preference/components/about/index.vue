<script setup lang="ts">
// import { emit } from '@tauri-apps/api/event' // TAURI-SPECIFIC
// import { appLogDir } from '@tauri-apps/api/path' // TAURI-SPECIFIC
// import { openPath, openUrl } from '@tauri-apps/plugin-opener' // TAURI-SPECIFIC
import { Button } from "ant-design-vue";
import { onMounted, ref } from "vue";

import ProList from "@/components/pro-list/index.vue";
import ProListItem from "@/components/pro-list-item/index.vue";
import { GITHUB_LINK } from "@/constants"; // Assuming constants will be copied
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const logDir = ref("");

onMounted(async () => {
  // logDir.value = await appLogDir() // TAURI-SPECIFIC - needs Electron equivalent (e.g., app.getPath('logs'))
  console.warn("TODO: Implement appLogDir for Electron");
  logDir.value = "path/to/electron/logs"; // Placeholder
});

function handleUpdate() {
  // emit(LISTEN_KEY.UPDATE_APP) // TAURI-SPECIFIC - needs Electron equivalent for app updates (e.g., ipcRenderer.send('check-for-updates'))
  console.warn("TODO: Implement emit(LISTEN_KEY.UPDATE_APP) for Electron");
}

function feedbackIssue() {
  // openUrl(`${GITHUB_LINK}/issues/new`) // TAURI-SPECIFIC - use Electron's shell.openExternal
  console.warn("TODO: Implement openUrl for Electron", `${GITHUB_LINK}/issues/new`);
}

function openLogPath() {
  // openPath(logDir.value) // TAURI-SPECIFIC - use Electron's shell.openPath
  console.warn("TODO: Implement openPath for Electron", logDir.value);
}
</script>

<template>
  <ProList title="关于软件">
    <ProListItem :description="`版本：v${appStore.version}`" :title="appStore.name">
      <Button type="primary" @click="handleUpdate"> 检查更新 </Button>

      <template #icon>
        <div class="b b-color-2 b-solid rounded-xl">
          <img class="size-12" src="/images/logo.png" />
        </div>
      </template>
    </ProListItem>

    <ProListItem title="开源地址">
      <Button danger @click="feedbackIssue"> 反馈问题 </Button>

      <template #description>
        <a :href="GITHUB_LINK">
          {{ GITHUB_LINK }}
        </a>
      </template>
    </ProListItem>

    <ProListItem :description="logDir" title="软件日志">
      <Button @click="openLogPath">
        <!-- Changed from openPath(logDir) -->
        查看日志
      </Button>
    </ProListItem>
  </ProList>
</template>
