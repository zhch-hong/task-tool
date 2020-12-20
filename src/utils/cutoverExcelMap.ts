import { readFileSync, writeFileSync } from 'fs';
import { Workbook, Worksheet } from 'exceljs';
import { WorkbookMap } from '@/shims-vue';
import { workbook2map } from './sheetToJson';
import { parseString2Number } from '@/utils';
import { getUserconfig } from '@/asserts/userconfig';
import { getSheet } from './likeSheet';
import { setColumnKey } from './setColumnKey';

function addTemplateCol(sheet: Worksheet) {
  const array: string[] = [];
  sheet.getRow(1).eachCell((cell) => array.push(cell.text));

  if (array.includes('|base_temp|任务数据')) return;

  const count = sheet.columnCount + 1;
  sheet.spliceColumns(
    count,
    0,
    ['|base_temp|任务数据'],
    ['|process_temp|进度数据'],
    ['|source_temp|来源数据']
  );
}

function descriptionColumn(sheet: Worksheet) {
  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell) => headers.push(cell.text));
  if (headers.includes('|任务内容说明')) return;

  sheet.getRow(1).splice(sheet.columnCount + 1, 0, '|任务内容说明');
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

export async function readExcelToMap(path: string): Promise<WorkbookMap> {
  const buffer = readFileSync(path);
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);
  return workbook2map(workbook);
}

export async function writeMapToExcel(workbookMap: WorkbookMap, path?: string) {
  if (!path) {
    const object: Record<string, string> = getUserconfig();
    const { lastOpenFile } = object;
    path = lastOpenFile;
  }

  if (!path) return;

  const buffer = readFileSync(path);
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);

  const taskSheet = getSheet(workbook, 'task');
  if (taskSheet) {
    descriptionColumn(taskSheet);
    addTemplateCol(taskSheet);
  }

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
    writeFileSync(path!, new Uint8Array(buffer));
  });
}
