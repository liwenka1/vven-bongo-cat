<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { Flex, Modal } from "ant-design-vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { computed, reactive, watch } from "vue";
import VueMarkdown from "vue-markdown-render";

import { useAppListen } from "@/composables/useElectronListen";
import { GITHUB_LINK, LISTEN_KEY } from "@/constants";
import { useGeneralStore } from "@/stores/general";

dayjs.extend(utc);

// Electron 更新信息接口
interface ElectronUpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string | null;
}

interface State {
  open: boolean;
  update?: ElectronUpdateInfo;
  downloading: boolean;
  downloadProgress: number;
}

const generalStore = useGeneralStore();
const state = reactive<State>({
  open: false,
  downloading: false,
  downloadProgress: 0
});

// 自动检查更新间隔
const { pause, resume } = useIntervalFn(checkUpdate, 1000 * 60 * 60 * 24);

watch(
  () => generalStore.autoCheckUpdate,
  (value) => {
    pause();
    if (!value) return;
    checkUpdate();
    resume();
  },
  { immediate: true }
);

// 监听手动更新检查请求
useAppListen<boolean>(LISTEN_KEY.UPDATE_APP, () => {
  checkUpdate();
});

const downloadProgressText = computed(() => {
  return state.downloading ? `${state.downloadProgress.toFixed(0)}%` : "立即更新";
});

async function checkUpdate() {
  console.warn("TODO: 实现 Electron 更新检查功能");
  // TODO: 实现 Electron 更新检查逻辑
  // 可以使用 electron-updater 库
}

async function handleOk() {
  console.warn("TODO: 实现 Electron 更新下载和安装功能");
  // TODO: 实现 Electron 更新下载和安装逻辑
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
