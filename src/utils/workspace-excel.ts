import fs from 'fs';
import path from 'path';
import store from '@/electron-store';

function workspanceExcel(dirPath: string = store.get('workDir') as string) {
  const array: Array<Record<string, any>> = [];
  const dirs = fs.readdirSync(dirPath);
  dirs.forEach((dir) => {
    const _path = path.resolve(dirPath, dir);
    const stats = fs.statSync(_path);
    if (stats.isFile()) {
      const extname = path.extname(_path);
      if (extname === '.xls' || extname === '.xlsx') {
        array.push({ label: dir, path: _path });
      }
    } else if (stats.isDirectory()) {
      const list = workspanceExcel(_path);
      if (list.length !== 0) {
        array.push({
          label: dir,
          path: _path,
          children: list,
        });
      }
    }
  });
  return array;
}

export { workspanceExcel };
