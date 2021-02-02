import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';

autoUpdater.autoDownload = false;

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString());
});

autoUpdater.on('update-available', () => {
  dialog
    .showMessageBox({
      type: 'info',
      title: '版本更新',
      message: '检测到新版本，是否立即下载？',
      detail: '下载将在后台进行，你可以继续使用，不会受任何影响',
      buttons: ['否', '是'],
      cancelId: -1,
    })
    .then((value) => {
      const buttonIndex = value.response;
      if (buttonIndex === 1) {
        autoUpdater.downloadUpdate();
      }
    })
    .catch(() => {
      //
    });
});

// autoUpdater.on('download-progress', (info: UpdateInfo) => {
//   const win = BrowserWindow.getFocusedWindow();

//   if (!win) return;

//   win.webContents.send('download-progress', info);
// });

autoUpdater.on('update-downloaded', () => {
  dialog
    .showMessageBox({
      title: '安装更新',
      message: '更新包已下载完成，是否立即安装重启？',
      buttons: ['取消安装', '立即安装'],
      cancelId: -1,
    })
    .then(({ response }) => {
      if (response === 1) {
        setImmediate(() => autoUpdater.quitAndInstall());
      }
    });
});

export { autoUpdater };
