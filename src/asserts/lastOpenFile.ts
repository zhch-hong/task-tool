import store from '@/store';
import { setColumnKey, workbook2map } from '@/utils';
import { Workbook } from 'exceljs';
import { getUserconfig } from '@/asserts/userconfig';
import { readFileBinary } from '@/utils/fileSystem';

export async function readLastFile(): Promise<string | undefined> {
  // 从配置文件读取最后一次打开的文件
  const object: Record<string, string> = getUserconfig();
  const { lastOpenFile } = object;

  if (!lastOpenFile) return;

  const buffer = readFileBinary(lastOpenFile);
  if (!buffer) return;

  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);

  setColumnKey(workbook);

  store.commit('taskFilePath', lastOpenFile);
  store.commit('workbookMap', workbook2map(workbook));

  return lastOpenFile;
}
