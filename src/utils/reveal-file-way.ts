import fs from 'fs';
import path from 'path';
import { shell } from 'electron';

/**
 * 在资源管理器中打开
 * @param path
 */
function revealInFileExplorer(path: string) {
  if (fs.existsSync(path)) {
    shell.showItemInFolder(path);
  }
}

/**
 * 通过Excel打开
 * @param path
 */
function openInExcel(_path: string) {
  const stat = fs.statSync(_path);
  if (stat.isFile()) {
    if (path.extname(_path) === '.xlsx' || path.extname(_path) === '.xls') {
      shell.openExternal(_path);
    }
  }
}

export { openInExcel, revealInFileExplorer };
