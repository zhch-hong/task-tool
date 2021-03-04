import Electron, { remote } from 'electron';
import { Titlebar, Color } from 'custom-electron-titlebar';
import {
  about,
  options,
  syncFile,
  redo,
  undo,
  createTask,
  deleteTask,
  copyTask,
  pasteTask,
  doubleTask,
  find,
  findNext,
  findPrev,
  fileManage,
  sourceManage,
  receive,
  enumerate,
  asset,
  taskBase,
  taskProcess,
  taskSource,
} from '@/menu';

const { Menu, getCurrentWindow } = remote;

const HelpMeu: Electron.MenuItemConstructorOptions[] =
  process.env.NODE_ENV === 'production'
    ? [
        {
          label: '关于',
          click: about,
        },
      ]
    : [
        {
          label: '重新加载',
          click: () => {
            getCurrentWindow().reload();
          },
        },
        {
          type: 'separator',
        },
        {
          label: '关于',
          click: about,
        },
      ];

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
        accelerator: 'Ctrl+T',
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
      {
        type: 'separator',
      },
      {
        label: '查找',
        accelerator: 'Ctrl+F',
        click: find,
      },
      {
        label: '查找上一个',
        accelerator: 'Shift+F3',
        click: findPrev,
      },
      {
        label: '查找下一个',
        accelerator: 'F3',
        click: findNext,
      },
    ],
  },
  {
    label: '配置',
    submenu: [
      {
        label: '文件管理',
        click: fileManage,
      },
      {
        label: '来源管理',
        click: sourceManage,
      },
      {
        label: '输入项管理',
        submenu: [
          {
            label: '获得类型',
            click: () => {
              receive();
              titlebar.updateMenu(menu);
            },
          },
          {
            label: '枚举类型',
            click: () => {
              enumerate();
              titlebar.updateMenu(menu);
            },
          },
          {
            label: '财富类型',
            click: () => {
              asset();
              titlebar.updateMenu(menu);
            },
          },
        ],
      },
      {
        label: '模板管理',
        submenu: [
          {
            label: '基础信息',
            click: () => {
              taskBase();
              titlebar.updateMenu(menu);
            },
          },
          {
            label: '任务进度',
            click: () => {
              taskProcess();
              titlebar.updateMenu(menu);
            },
          },
          {
            label: '任务来源',
            click: () => {
              taskSource();
              titlebar.updateMenu(menu);
            },
          },
        ],
      },
    ],
  },
  {
    label: '帮助',
    submenu: HelpMeu,
  },
]);

const titlebar = new Titlebar({
  backgroundColor: Color.fromHex('#0062b3'),
  icon: './icon_36.png',
  menu: menu,
});

titlebar.updateTitle('任务配置工具');

export { titlebar };
