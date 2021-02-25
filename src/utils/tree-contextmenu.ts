import path from 'path';
import electron from 'electron';

import ExcelIcon from '@/assets/contextmenu_icon/icons8-microsoft-excel-2019-21.png';
import FolderIcon from '@/assets/contextmenu_icon/icons8-folder-21.png';
import { openInExcel, revealInFileExplorer } from '.';

export function contextmenu(_path: string) {
  const menu = new electron.remote.Menu();
  const folderIcon = electron.nativeImage.createFromDataURL(FolderIcon);
  menu.append(
    new electron.remote.MenuItem({
      label: '在资源管理器中展示',
      icon: folderIcon,
      click: function () {
        revealInFileExplorer(_path);
      },
    })
  );

  if (path.extname(_path) === '.xlsx' || path.extname(_path) === '.xls') {
    const excelIcon = electron.nativeImage.createFromDataURL(ExcelIcon);
    menu.append(
      new electron.remote.MenuItem({
        label: '通过Excel打开',
        icon: excelIcon,
        click: function () {
          openInExcel(_path);
        },
      })
    );
  }

  menu.popup();
}
