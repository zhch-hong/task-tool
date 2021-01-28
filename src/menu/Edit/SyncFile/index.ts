import router from '@/router';
import { remote } from 'electron';
import { workDir } from '@/asserts/dir-config';

const { dialog, getCurrentWindow } = remote;

export function syncFile() {
  const paths = dialog.showOpenDialogSync(getCurrentWindow(), {
    title: '打开文件',
    properties: ['openFile'],
    defaultPath: workDir,
    filters: [{ name: 'Excel文件', extensions: ['xls', 'xlsx'] }],
  });

  if (typeof paths !== 'undefined') {
    if (router.currentRoute.path !== '/sync-file') {
      router.push(`/sync-file/${paths[0]}`);
    }
  }
}
