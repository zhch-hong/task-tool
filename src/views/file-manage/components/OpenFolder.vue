<template>
  <div>
    <el-button @click="$emit('refresh')">刷新</el-button>
    <!-- <el-tooltip content="需要重启"> -->
    <el-button @click="openFolder">选择文件夹</el-button>
    <!-- </el-tooltip> -->
    <span>{{ path }}</span>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { remote } from 'electron';
import { workDir, setWorkDir } from '@/asserts/dir-config';
import { getUserconfig, setUserconfig } from '@/asserts/userconfig';

@Component
export default class OpenFolder extends Vue {
  path = workDir;

  async openFolder(): Promise<void> {
    const { dialog } = remote;
    const response = dialog.showOpenDialogSync({
      title: '请选择工作目录',
      buttonLabel: '设为工作目录',
      defaultPath: this.path,
      properties: ['openDirectory'],
    });

    if (typeof response !== 'undefined') {
      const path = setWorkDir();
      this.path = path;
      this.setUserFolder(path);
    }
  }

  setUserFolder(path: string): void {
    const config = getUserconfig();
    config['workDir'] = path;
    setUserconfig(config);
    this.$emit('refresh');

    // const { app } = remote;
    // app.relaunch();
    // app.quit();
  }
}
</script>
