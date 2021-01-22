<template>
  <el-dialog :visible.sync="visiblesync" :close-on-click-modal="false">
    <el-form>
      <el-form-item label="配置存储路径">
        <span class="config-dir" @click="setConfigDir">{{ configDir }}</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <DialogFooter @resolve="submit" @reject="visiblesync = false" />
    </template>
  </el-dialog>
</template>
<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator';
import { remote } from 'electron';
import { configDir, dirConfigPath } from '@/asserts/dir-config';
import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';

import DialogFooter from '@/components/DialogFooter.vue';

const { app, dialog } = remote;

@Component({
  components: { DialogFooter },
})
export default class Options extends Vue {
  @PropSync('visible', { type: Boolean, default: false }) visiblesync!: boolean;

  configDir = configDir;

  submit(): void {
    dialog.showMessageBoxSync({
      title: '重启软件',
      message: '需要重启软件以生效',
      type: 'info',
    });

    const config: Record<string, string> = JSON.parse(
      readFileSync(dirConfigPath).toString()
    );
    config.configDir = this.configDir;
    writeFileSync(dirConfigPath, Buffer.from(JSON.stringify(config)));

    exec(
      `xcopy /e ${configDir}\\app_config\\ ${this.configDir}\\app_config\\`,
      (error) => {
        if (error) throw error;
        exec(`rmdir /s /q ${configDir}\\app_config`, (errorⅡ) => {
          if (errorⅡ) throw errorⅡ;
          app.relaunch();
          app.quit();
        });
      }
    );
  }

  setConfigDir(): void {
    const response = dialog.showOpenDialogSync({
      title: '请选择配置存储路径',
      properties: ['openDirectory'],
      defaultPath: this.configDir,
    });

    if (typeof response !== 'undefined') {
      const path = response[0];
      this.configDir = path;
    }
  }
}
</script>
<style lang="scss" scoped>
.config-dir {
  cursor: pointer;
  &:hover {
    text-decoration-line: underline;
  }
}
</style>
