<script setup lang="ts">
import { Button } from "ant-design-vue";
import { onMounted, ref } from "vue";

import ProList from "@/components/pro-list/index.vue";
import ProListItem from "@/components/pro-list-item/index.vue";
import { GITHUB_LINK } from "@/constants";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const logDir = ref("");

onMounted(async () => {
  // TODO: 获取 Electron 日志目录
  logDir.value = "待实现：获取日志目录";
});

function handleUpdate() {
  // TODO: 触发更新检查
  console.log("检查更新功能待实现");
}

function feedbackIssue() {
  window.electron?.openExternal(`${GITHUB_LINK}/issues/new`);
}

function openLogPath() {
  // TODO: 打开日志目录
  console.log("打开日志目录功能待实现:", logDir.value);
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
