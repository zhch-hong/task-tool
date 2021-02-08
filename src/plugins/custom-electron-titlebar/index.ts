import { remote } from 'electron';
import { Titlebar, Color } from 'custom-electron-titlebar';
import { about, options, syncFile, redo, undo, createTask, deleteTask, copyTask, pasteTask, doubleTask } from '@/menu';

const { Menu } = remote;

const menu = Menu.buildFromTemplate([
  {
    label: '文件',
    submenu: [
      {
        label: '选项',
        click: options,
      },
      {
        type: 'separator',
      },
      {
        label: '退出',
        click: () => {
          const { app } = remote;
          app.quit();
        },
      },
    ],
  },
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'Ctrl+Z',
        click: undo,
      },
      {
        label: '恢复',
        accelerator: 'Ctrl+Y',
        click: redo,
      },
      {
        label: '同步文件',
        click: syncFile,
      },
      {
        type: 'separator',
      },
      {
        label: '添加任务',
        accelerator: 'Ctrl+N',
        click: createTask,
      },
      {
        label: '删除任务',
        accelerator: 'Ctrl+R',
        click: deleteTask,
      },
      {
        label: '拷贝任务',
        accelerator: 'Ctrl+C',
        click: copyTask,
      },
      {
        label: '粘贴任务',
        accelerator: 'Ctrl+V',
        click: pasteTask,
      },
      {
        label: '复制任务',
        accelerator: 'Ctrl+D',
        click: doubleTask,
      },
    ],
  },
  {
    label: '帮助',
    submenu: [
      {
        label: '关于',
        click: about,
      },
    ],
  },
]);

const titlebar = new Titlebar({
  backgroundColor: Color.fromHex('#EAEAEB'),
  itemBackgroundColor: Color.fromHex('#d7d7da'),
  icon: './icon_36.png',
  menu: menu,
});

titlebar.updateTitle('任务配置工具');

export { titlebar };
