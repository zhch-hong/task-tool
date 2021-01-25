import { remote } from 'electron';
import { Titlebar, Color } from 'custom-electron-titlebar';
import { ComponentInstanceModule } from '@/store/modules/component-instance';
import { about, options } from '@/menu';

const { app, dialog, Menu } = remote;

const menu = Menu.buildFromTemplate([
  {
    label: '文件',
    submenu: [
      {
        label: '选项',
        click: options,
      },
    ],
  },
  {
    label: '编辑',
    submenu: [
      {
        label: '添加任务',
        accelerator: 'Ctrl+N',
        click: () => {
          const ins = ComponentInstanceModule.instance('EditFile');
          if (ins) ins.createTask();
        },
      },
      {
        label: '删除任务',
        accelerator: 'Ctrl+R',
        click: () => {
          const ins = ComponentInstanceModule.instance('EditFile');
          if (ins) ins.deleteTask();
        },
      },
      {
        label: '拷贝任务',
        accelerator: 'Ctrl+C',
        click: () => {
          const ins = ComponentInstanceModule.instance('EditFile');
          if (ins) ins.copySelection();
        },
      },
      {
        label: '粘贴任务',
        accelerator: 'Ctrl+V',
        click: () => {
          const ins = ComponentInstanceModule.instance('EditFile');
          if (ins) ins.pasteTask();
        },
      },
      {
        label: '复制任务',
        accelerator: 'Ctrl+D',
        click: () => {
          const ins = ComponentInstanceModule.instance('EditFile');
          if (ins) ins.doubleTask();
        },
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
  backgroundColor: Color.fromHex('#ececec'),
  icon: './icon_36.png',
  menu: menu,
});

titlebar.updateTitle('任务配置工具');

export { titlebar };
