<script setup lang="ts">
// import type { Update } from '@tauri-apps/plugin-updater' // TAURI-SPECIFIC

// import { relaunch } from '@tauri-apps/plugin-process' // TAURI-SPECIFIC
// import { check } from '@tauri-apps/plugin-updater' // TAURI-SPECIFIC
import { useIntervalFn } from "@vueuse/core";
import { Flex, message, Modal } from "ant-design-vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { computed, reactive, watch } from "vue";
import VueMarkdown from "vue-markdown-render";

// import { useTauriListen } from '@/composables/useTauriListen' // Replaced with useAppListen
import { useAppListen } from "@/composables/useTauriListen"; // Using adapted one
import { GITHUB_LINK, LISTEN_KEY } from "@/constants";
// import { showWindow } from '@/plugins/window' // This needs Electron adaptation
import { useGeneralStore } from "@/stores/general";

dayjs.extend(utc);

// Electron update object structure (example, depends on electron-updater)
interface ElectronUpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string | null;
  // other fields from electron-updater as needed
}

interface State {
  open: boolean;
  update?: ElectronUpdateInfo; // Adapted for Electron
  downloading: boolean;
  totalProgress?: number; // For electron-updater, progress is often 0-100
  downloadProgress: number; // Percentage for electron-updater
}

const generalStore = useGeneralStore();
const state = reactive<State>({
  open: false,
  downloading: false,
  downloadProgress: 0
});
const MESSAGE_KEY = "updatable";

// TODO: Electron update check needs to be implemented using IPC to main process (e.g., with electron-updater)
const { pause, resume } = useIntervalFn(checkUpdate, 1000 * 60 * 60 * 24); // Interval for auto-check

watch(
  () => generalStore.autoCheckUpdate,
  (value) => {
    pause();
    if (!value) return;
    checkUpdate(); // Initial check if enabled
    resume();
  },
  { immediate: true }
);

// Listen for manual update check requests
useAppListen<boolean>(LISTEN_KEY.UPDATE_APP, () => {
  checkUpdate(true);
});

const downloadProgressText = computed(() => {
  // For electron-updater, progress is usually a percentage
  return state.downloading ? `${state.downloadProgress.toFixed(0)}%` : "立即更新";
});

async function checkUpdate(visibleMessage = false) {
  console.warn("TODO: Implement checkUpdate for Electron using IPC");
  // Example IPC call to main process to check for updates:
  // if (window.electronAPI && window.electronAPI.checkForUpdates) {
  //   if (visibleMessage) {
  //     message.loading({ key: MESSAGE_KEY, duration: 0, content: '正在检查更新...' });
  //   }
  //   try {
  //     const updateInfo = await window.electronAPI.checkForUpdates();
  //     if (updateInfo) {
  //       state.update = {
  //            version: updateInfo.version,
  //            releaseDate: dayjs.utc(updateInfo.releaseDate).local().format('YYYY-MM-DD HH:mm:ss'),
  //            releaseNotes: replaceBody(updateInfo.releaseNotes || ''),
  //       };
  //       // Potentially call showWindow() equivalent for Electron if needed
  //       state.open = true;
  //       message.destroy(MESSAGE_KEY);
  //     } else if (visibleMessage) {
  //       message.success({ key: MESSAGE_KEY, content: '当前已是最新版本🎉' });
  //     }
  //   } catch (error) {
  //     if (visibleMessage) message.error({ key: MESSAGE_KEY, content: String(error) });
  //   }
  // }
}

function replaceBody(body: string) {
  // This function seems fine as is
  return body
    .replace(/&nbsp;/g, "")
    .split("\n")
    .map((line) => line.replace(/\s*-\s+by\s+@.*/, ""))
    .join("\n");
}

async function handleOk() {
  console.warn("TODO: Implement handleOk for Electron update download/install using IPC");
  // Example IPC calls for electron-updater:
  // if (window.electronAPI && state.update) {
  //   try {
  //     state.downloading = true;
  //     // Listen for download progress
  //     window.electronAPI.onUpdateDownloadProgress((progressObj: { percent: number }) => {
  //       state.downloadProgress = progressObj.percent;
  //     });
  //     await window.electronAPI.downloadUpdate(); // Main process downloads
  //     // After download, main process might auto-quit and install, or prompt renderer
  //     // For simplicity, assume main process handles relaunch after download
  //     // window.electronAPI.quitAndInstall(); // If manual trigger from renderer is needed
  //   } catch (error) {
  //     message.error(String(error));
  //     state.downloading = false;
  //   }
  //   // No finally state.downloading = false, as app might quit.
  // }
}
</script>

<template>
  <Modal
    v-model:open="state.open"
    cancel-text="稍后更新"
    centered
    :closable="false"
    :mask-closable="false"
    :ok-button-props="{ loading: state.downloading }"
    title="发现新版本🥳"
    @ok="handleOk"
  >
    <template #okText>
      {{ downloadProgressText }}
    </template>

    <Flex class="pt-1" gap="small" vertical>
      <Flex align="center">
        <span>更新版本：</span>
        <span>
          <!-- <span>{{ state.update?.currentVersion }} 👉 </span> currentVersion might not be available -->
          <a :href="`${GITHUB_LINK}/releases/tag/v${state.update?.version}`" target="_blank" rel="noopener noreferrer">
            v{{ state.update?.version }}
          </a>
        </span>
      </Flex>

      <Flex align="center">
        <span>更新时间：</span>
        <span>{{ state.update?.releaseDate }}</span>
      </Flex>

      <Flex vertical>
        <span>更新日志：</span>
        <VueMarkdown class="max-h-40 overflow-auto" :source="state.update?.releaseNotes ?? ''" />
      </Flex>
    </Flex>
  </Modal>
</template>

<style scoped></style>
