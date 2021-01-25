<template>
  <div class="storage-dir">
    <p class="title">配置数据存储路径</p>
    <p>
      配置的来源、模板、货币类型等数据存储的路径，该路径在修改时会自动将原路径下的数据移动至新的路径下，请勿手动操作该文件夹下的文件。<b
        >修改该路径需要重启软件。</b
      >
    </p>
    <div class="items-center">
      <input v-model.trim.lazy="path" class="path-input" type="text" />
      <button class="set" @click="setConfigDir">选择路径</button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { remote } from 'electron';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { exec } from 'child_process';
import { configDir, dirConfigPath } from '@/asserts/dir-config';

const { app, dialog } = remote;

export default Vue.extend({
  name: 'StorageDir',

  data() {
    return {
      path: configDir,
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
          this.path = configDir;
        }
      },
    },
  },

  methods: {
    setConfigDir(): void {
      const response = dialog.showOpenDialogSync({
        title: '请选择配置存储路径',
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
      config.configDir = this.path;
      writeFileSync(dirConfigPath, Buffer.from(JSON.stringify(config)));

      exec(
        `xcopy /e ${configDir}\\app_config\\ ${this.path}\\app_config\\`,
        (error) => {
          if (error) throw error;
          exec(`rmdir /s /q ${configDir}\\app_config`, (errorⅡ) => {
            if (errorⅡ) throw errorⅡ;
            dialog.showMessageBoxSync({
              title: '重启软件',
              message: '需要重启软件以生效',
              type: 'info',
            });
            setTimeout(() => {
              app.relaunch();
              app.quit();
            }, 500);
          });
        }
      );
    },
  },
});
</script>
.
<style lang="scss" scoped>
div.storage-dir {
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
input.path-input {
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
