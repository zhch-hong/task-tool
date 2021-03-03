import path from 'path';
import fs from 'fs';
import Vue from 'vue';
import { TreeData } from 'element-ui/types/tree';

import store from '@/electron-store';
import { ConfigFilesModule } from '@/store/modules/config-files';

interface TreeMeta extends TreeData {
  path: string;
}

const DATA_MEMORY: TreeMeta[] = [];

new Vue({
  computed: {
    data() {
      return ConfigFilesModule.fileData;
    },
  },

  watch: {
    data: {
      handler(data: Record<string, string>[]) {
        const fileList = data.map((item) => item.file);
        const tree = getTreeData(store.get('workDir') as string, fileList);

        if (JSON.stringify(DATA_MEMORY) === JSON.stringify(tree)) return;

        DATA_MEMORY.splice(0, DATA_MEMORY.length, ...tree);
      },
    },
  },
});

export function getTreeData(dirPath = store.get('workDir') as string, fileList: string[] = []): TreeMeta[] {
  const array: TreeMeta[] = [];
  const dirs = fs.readdirSync(dirPath);
  dirs.forEach((dir) => {
    const _path = path.resolve(dirPath, dir);
    const stats = fs.statSync(_path);
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

export { DATA_MEMORY };
