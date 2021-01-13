<template>
  <div>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <button @click="onclick">UPDATE</button>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { ipcRenderer } from 'electron';
import { IpcRendererEvent } from 'electron/renderer';

export default Vue.extend({
  name: 'electron',

  data() {
    return {
      title: 'title',
      message: 'message',
    };
  },

  created(): void {
    ipcRenderer.on('electron', this.electron);
    ipcRenderer.on('error', this.error);
    ipcRenderer.on('checkForUpdates', this.checkForUpdates);
    ipcRenderer.on('update-available', this.updateAvailable);
    ipcRenderer.on('update-not-available', this.updateNotAvailable);
    ipcRenderer.on('download-progress', this.downloadProgress);
    ipcRenderer.on('update-downloaded', this.updateDownloaded);
  },

  beforeRouteLeave(): void {
    ipcRenderer.off('electron', this.electron);
    ipcRenderer.off('error', this.error);
    ipcRenderer.off('check-for-updates', this.checkForUpdates);
    ipcRenderer.off('update-available', this.updateAvailable);
    ipcRenderer.off('update-not-available', this.updateNotAvailable);
    ipcRenderer.off('download-progress', this.downloadProgress);
    ipcRenderer.off('update-downloaded', this.updateDownloaded);
  },

  methods: {
    onclick(): void {
      ipcRenderer.send('upgrade');
    },

    electron(): void {
      console.log('electron');
    },

    error(error: IpcRendererEvent): void {
      console.log('error', error);

      this.title = '更新出错';
      this.message = JSON.stringify(error);
    },

    updateAvailable(info: IpcRendererEvent): void {
      console.log('updateavailable', info);

      this.title = '有可用更新';
      this.message = JSON.stringify(info);
    },

    updateNotAvailable(info: IpcRendererEvent): void {
      console.log('updatenotavailable', info);

      this.title = '无可用更新';
      this.message = JSON.stringify(info);
    },

    downloadProgress(info: IpcRendererEvent): void {
      console.log('downloadprogress', info);

      this.title = '正在下载';
      this.message = JSON.stringify(info);
    },

    updateDownloaded(info: IpcRendererEvent): void {
      console.log('updatedownloaded', info);

      this.title = '下载完成';
      this.message = JSON.stringify(info);
    },

    checkForUpdates(info: IpcRendererEvent): void {
      console.log('checkForUpdates', info);
    },
  },
});
</script>
