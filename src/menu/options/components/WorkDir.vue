<template>
  <div class="container">
    <p class="title">工作目录</p>
    <p>
      设置工作空间文件夹，该文件夹受程序控制，请勿手动修改该文件夹下的文件内容，以免造成数据错乱。<b
        >修改该路径需要重启软件。</b
      >
    </p>
    <div class="items-center">
      <input v-model.trim.lazy="path" class="input" type="text" />
      <button class="set" @click="setWorkDir">选择路径</button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { remote } from 'electron';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { workDir, dirConfigPath } from '@/asserts/dir-config';

const { app, dialog } = remote;

export default Vue.extend({
  name: 'WorkDir',

  data() {
    return {
      path: workDir,
    };
  },

  watch: {
    path: {
      handler(value: string) {
        const stat = statSync(value);
        if (stat.isDirectory()) {
          this.relaunch();
        } else {
          dialog.showErrorBox('无效路径', '该路径无效，请重新选择');
          this.path = workDir;
        }
      },
    },
  },

  methods: {
    setWorkDir(): void {
      const response = dialog.showOpenDialogSync({
        title: '请选择工作目录',
        properties: ['openDirectory'],
        defaultPath: this.path,
      });

      if (typeof response !== 'undefined') {
        const path = response[0];
        this.path = path;
      }
    },

    relaunch(): void {
      const config: Record<string, string> = JSON.parse(
        readFileSync(dirConfigPath).toString()
      );
      config.workDir = this.path;
      writeFileSync(dirConfigPath, Buffer.from(JSON.stringify(config)));

      setTimeout(() => {
        dialog.showMessageBoxSync({
          title: '重启软件',
          message: '需要重启软件以生效',
          type: 'info',
        });
        app.relaunch();
        app.quit();
      }, 1000);
    },
  },
});
</script>
.
<style lang="scss" scoped>
div.container {
  cursor: default;
  padding: 2px 20px 20px;
  &:hover {
    background-color: #e6e6e6;
  }
}
p.title {
  font-size: 17px;
  font-weight: 600;
}
div.items-center {
  display: flex;
  align-items: center;
}
input.input {
  outline: none;
  border-radius: 0;
  border: 1px solid #b3b3b3;
  width: 500px;
  background: #f2f2f2;
  margin-right: 10px;
  padding: 2px;
}
button.set {
  outline: none;
  border: 1px solid;
  border-radius: 0;
  cursor: pointer;
}
</style>
