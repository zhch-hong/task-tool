import store from '@/store';
import {
  getSheet,
  parseString2Number,
  readFile,
  setColumnKey,
  workbook2map,
} from '@/utils';
import { Workbook, Worksheet } from 'exceljs';
import { userdir } from './userdir';
import { readFileSync, writeFileSync } from 'fs';
import { WorkbookMap } from '@/shims-vue';

export async function readLastFile(): Promise<string | undefined> {
  // 从配置文件读取最后一次打开的文件
  const object: Record<string, string> = readFile(userdir);
  const { lastOpenFile } = object;

  if (!lastOpenFile) return;

  const buffer = readFileSync(lastOpenFile);
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);

  setColumnKey(workbook);

  store.commit('taskFilePath', lastOpenFile);
  store.commit('workbookMap', workbook2map(workbook));

  return lastOpenFile;
}

export async function writeWorkbookMapToExcel(workbookMap: WorkbookMap) {
  const object: Record<string, string> = readFile(userdir);
  const { lastOpenFile } = object;

  if (!lastOpenFile) return;

  const buffer = readFileSync(lastOpenFile);
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);

  addTemplateCol(getSheet(workbook, 'task')!);

  setColumnKey(workbook);

  const taskList = workbookMap.get('task') as Record<string, string>[];
  const processList = workbookMap.get('process_data') as Record<
    string,
    string
  >[];
  const sourceList = workbookMap.get('source') as Record<string, string>[];
  const conditionList = workbookMap.get('condition') as Record<
    string,
    string
  >[];
  const awardList = workbookMap.get('award_data') as Record<string, string>[];

  const newWorkbook = new Workbook();

  const taskSheet = getSheet(workbook, 'task');
  jsonToSheet(newWorkbook, taskList, taskSheet);

  const processSheet = getSheet(workbook, 'process_data');
  jsonToSheet(newWorkbook, processList, processSheet);

  const sourceSheet = getSheet(workbook, 'source');
  jsonToSheet(newWorkbook, sourceList, sourceSheet);

  const conditionSheet = getSheet(workbook, 'condition');
  jsonToSheet(newWorkbook, conditionList, conditionSheet);

  const awardSheet = getSheet(workbook, 'award_data');
  jsonToSheet(newWorkbook, awardList, awardSheet);

  newWorkbook.xlsx.writeBuffer().then((buffer) => {
    writeFileSync(lastOpenFile, new Uint8Array(buffer));
  });
}

function addTemplateCol(sheet: Worksheet) {
  const count = sheet.columnCount + 1;
  sheet.spliceColumns(
    count,
    0,
    ['|base_temp|任务数据'],
    ['|process_temp|进度数据'],
    ['|source_temp|来源数据']
  );
}

function jsonToSheet(
  workbook: Workbook,
  json: Record<string, string>[],
  sheet?: Worksheet
) {
  if (sheet) {
    const sheetName = sheet.name;
    const columns = sheet.columns;
    const headRow = sheet.getRow(1);

    const firstRow: string[] = [];
    headRow.eachCell((cell, index) => {
      if (cell.text) firstRow.push(cell.text);
    });

    const newTask = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
    });
    newTask.columns = columns.slice(0, firstRow.length);
    newTask.addRow(firstRow);
    json.forEach((item) => parseString2Number(item));
    newTask.addRows(json);
  }
}
