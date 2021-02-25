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
import store from '@/electron-store';
import { remote } from 'electron';
import { statSync } from 'fs';

const { app, dialog, getCurrentWindow } = remote;

export default Vue.extend({
  name: 'WorkDir',

  data() {
    return {
      path: store.get('workDir') as string,
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
          this.path = store.get('workDir') as string;
        }
      },
    },
  },

  methods: {
    setWorkDir(): void {
      const win = getCurrentWindow();
      win.focus();
      const response = dialog.showOpenDialogSync(win, {
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
      store.set('workDir', this.path);

      setTimeout(() => {
        const win = getCurrentWindow();
        win.focus();
        dialog.showMessageBoxSync(win, {
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
