import { resolve } from 'path';
import fs, { readdirSync, statSync } from 'fs';
import { TreeData } from 'element-ui/types/tree';
import { readFileText } from './fileSystem';
import store from '@/electron-store';

interface TreeMeta extends TreeData {
  path: string;
}

const path = resolve(resolve(store.get('configDir') as string, 'app_config'), 'file-manage.json');
let dataMemory: TreeMeta[] | null = null;

export function getTreeData(path: string = store.get('workDir') as string, fileList: string[] = []): TreeMeta[] {
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

function watchFile() {
  fs.watch(path, (eventType, filename) => {
    if (eventType === 'change') {
      dataMemory = null;
      getTreeDataDefault();
    }

    if (eventType === 'rename') {
      if (fs.existsSync(filename)) {
        dataMemory = null;
        getTreeDataDefault();
      } else {
        dataMemory = null;
      }
    }
  });
}

export function getTreeDataDefault(): TreeMeta[] {
  if (dataMemory) return dataMemory;

  watchFile();

  const array: Record<string, string>[] = readFileText(path);

  const fileList = array.map((item) => item.file);

  dataMemory = getTreeData(store.get('workDir') as string, fileList);

  return dataMemory;
}
