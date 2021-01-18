import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';
import { TreeData } from 'element-ui/types/tree';
import { getUserconfig } from '@/asserts/userconfig';
import { readFileText } from './fileSystem';

interface TreeMeta extends TreeData {
  path: string;
  name?: string;
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

export function getTreeDataDefault(): TreeMeta[] {
  const dir = getUserconfig().workDir;
  const path = resolve(dir, 'app_config', 'file-manage.json');
  const array: Record<string, string>[] = readFileText(path);
  const fileList = array.map((item) => item.file);

  const data = getTreeData(dir, fileList);
  return data;
}
