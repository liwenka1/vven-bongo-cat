<script setup lang="ts">
import Versions from "./components/Versions.vue";
import { Button } from "@renderer/components/ui/button";

const ipcHandle = () => window.electron.ipcRenderer.send("ping");
</script>

<template>
  <Versions />
  <Button>Click me</Button>
  <Button @click="ipcHandle">Send IPC</Button>
</template>
