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
import { workDir } from '@/asserts/dir-config';
import { getUserconfig, setUserconfig } from '@/asserts/userconfig';

@Component
export default class OpenFolder extends Vue {
  path = workDir;

  async openFolder(): Promise<void> {
    const { dialog, getCurrentWindow } = remote;
    const response = dialog.showOpenDialogSync(getCurrentWindow(), {
      title: '请选择工作目录',
      buttonLabel: '设为工作目录',
      defaultPath: this.path,
      properties: ['openDirectory'],
    });

    if (typeof response !== 'undefined') {
      if (response[0] === workDir) {
        return;
      }

      const n = dialog.showMessageBoxSync({
        title: '重启软件',
        message: '工作目录已改变，需要重启生效',
        cancelId: -1,
        type: 'info',
        buttons: ['取消', '确定'],
      });

      if (n === 1) {
        const path = response[0];
        this.path = path;
        this.setUserFolder(path);
      }
    }
  }

  setUserFolder(path: string): void {
    const config = getUserconfig();
    config['workDir'] = path;
    setUserconfig(config);

    const { app } = remote;
    app.relaunch();
    app.quit();
  }
}
</script>
