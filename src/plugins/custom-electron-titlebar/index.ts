import { Titlebar, Color } from 'custom-electron-titlebar';

const titlebar = new Titlebar({
  backgroundColor: Color.fromHex('#ececec'),
  icon: './icon_36.png',
  menu: null,
});

titlebar.updateTitle('任务配置工具');

export { titlebar };
