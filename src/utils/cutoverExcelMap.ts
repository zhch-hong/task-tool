import { readFileSync } from 'fs';
import { Workbook } from 'exceljs';
import { WorkbookMap } from '@/shims-vue';
import { workbook2map } from './sheetToJson';
import { writeWorkbookMapToExcel } from '@/asserts/lastOpenFile';

export async function excel2map(path: string): Promise<WorkbookMap> {
  const buffer = readFileSync(path);
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);

  return workbook2map(workbook);
}

export function map2excel(workbookMap: WorkbookMap, path: string): void {
  writeWorkbookMapToExcel(workbookMap, path);
}
