import { ipcMain, dialog } from 'electron';
import { error } from 'electron-log';

ipcMain.on('runtime-error', (event, ...args) => {
  error(...args);
});
