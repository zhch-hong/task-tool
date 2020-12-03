import store from '@/store';
import { writeFileSync } from 'fs';
import { Workbook } from 'exceljs';

import { sheetToJson } from '@/utils/sheetToJson';
import { writeFile } from '@/utils/fileStream';

const path = store.state.taskFilePath;
const workbook = store.state.workbook as Workbook;

export function writeExcel(data: Record<string, any>) {
  const base: Record<string, any> = data.base;
  const progress: Record<string, any> = data.progress;
  const source: Record<string, any>[] = data.source;
  console.log(base);
  console.log(progress);
  console.log(source);

  writeBase(base);
}

function writeBase(data: Record<string, any>) {
  const ws = workbook.getWorksheet('task');

  // workbook.xlsx.writeBuffer().then((buffer) => {
  //   writeFileSync(path, new Uint8Array(buffer));
  // });
}
