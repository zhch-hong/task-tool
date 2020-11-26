<template>
  <div>
    <el-button @click="$emit('refresh')">刷新</el-button>
    <el-button @click="openFolder">选择文件夹</el-button>
    <span>{{ path }}</span>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { remote } from 'electron';

const { dialog } = remote;

@Component
export default class OpenFolder extends Vue {
  path = '';

  async openFolder(): Promise<void> {
    const res = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    const path = res.filePaths[0];
    this.path = path;
    this.$emit('filder-path', path);
  }
}
</script>
