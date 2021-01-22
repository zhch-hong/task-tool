import { remote } from 'electron';
import { Titlebar, Color } from 'custom-electron-titlebar';

import { options } from '@/menu/options';

const { Menu } = remote;

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
]);

const titlebar = new Titlebar({
  backgroundColor: Color.fromHex('#ececec'),
  icon: './icon_36.png',
  menu: menu,
});

titlebar.updateTitle('任务配置工具');

export { titlebar };
