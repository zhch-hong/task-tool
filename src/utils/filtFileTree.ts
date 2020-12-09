import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';
import { TreeData } from 'element-ui/types/tree';

interface TreeMeta extends TreeData {
  path: string;
}

export function getTreeData(path: string, fileList: string[]): TreeMeta[] {
  const array: TreeMeta[] = [];
  const dirs = readdirSync(path);
  dirs.forEach((dir) => {
    const _path = resolve(path, dir);
    const stats = statSync(_path);
    if (stats.isFile()) {
      if (fileList.includes(dir)) {
        array.push({ label: dir, path: _path });
      }
    } else if (stats.isDirectory()) {
      const list = getTreeData(_path, fileList);
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
