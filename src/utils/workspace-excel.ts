import fs from 'fs';
import path from 'path';

import { workDir } from '@/asserts/dir-config';

function workspanceExcel(dirPath: string = workDir) {
  const array: Array<Record<string, any>> = [];
  const dirs = fs.readdirSync(dirPath);
  dirs.forEach((dir) => {
    const _path = path.resolve(dirPath, dir);
    const stats = fs.statSync(_path);
    if (stats.isFile()) {
      const extname = path.extname(_path);
      if (extname === '.xls' || extname === '.xlsx') {
        console.log(_path);

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
