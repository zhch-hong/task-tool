import store from '@/store';
import { readFile, setColumnKey, workbook2map } from '@/utils';
import { Workbook } from 'exceljs';
import { userdir } from './userdir';
import { readFileSync } from 'fs';

export async function setLastFile(): Promise<string | undefined> {
  // 从配置文件读取最后一次打开的文件
  const object: Record<string, string> = readFile(userdir);
  const { lastOpenFile } = object;
  if (!lastOpenFile) return;

  const wb = new Workbook();
  const buffer = readFileSync(lastOpenFile);
  const workbook = await wb.xlsx.load(buffer);

  setColumnKey(workbook);

  store.commit('taskFilePath', lastOpenFile);
  store.commit('workbookMap', workbook2map(workbook));

  return lastOpenFile;
}
