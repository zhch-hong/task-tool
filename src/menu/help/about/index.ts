import { remote } from 'electron';

const { app, dialog, getCurrentWindow } = remote;

export function about() {
  const win = getCurrentWindow();
  win.focus();
  dialog.showMessageBoxSync(win, {
    title: '关于',
    message: '任务配置工具',
    detail: `版本：${app.getVersion()}`,
  });
}
