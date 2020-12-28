import store from '@/store';
import { statSync } from 'fs';
import { setColumnKey, workbook2map } from '@/utils';
import { Workbook } from 'exceljs';
import { getUserconfig } from '@/asserts/userconfig';
import { readFileBinary } from '@/utils/fileSystem';

export function readLastFile() {
  return new Promise<string>((resolve, reject) => {
    // 从配置文件读取最后一次打开的文件
    const object: Record<string, string> = getUserconfig();
    const { lastOpenFile } = object;

    if (!lastOpenFile) {
      reject();
      return;
    }

    const stat = statSync(lastOpenFile);
    if (stat.isDirectory()) {
      reject();
      return;
    }

    const buffer = readFileBinary(lastOpenFile);
    if (!buffer) {
      reject();
      return;
    }

    const workbook = new Workbook();
    workbook.xlsx.load(buffer).then(() => {
      setColumnKey(workbook);

      store.commit('taskFilePath', lastOpenFile);
      store.commit('workbookMap', workbook2map(workbook));

      resolve(lastOpenFile);
    });
  });
}
