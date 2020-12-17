import { SheetName, WorkbookMap } from '@/shims-vue';
import { Workbook, Worksheet } from 'exceljs';
import { v4 as uuid } from 'uuid';

export function sheet2json(sheet: Worksheet): Record<string, string>[] {
  const column = sheet.getColumn(1);
  if (!column.key) sheet = setColumnKey(sheet);

  const array: Record<string, string>[] = [];
  const keys = sheet.columns
    .map((column) => column.key)
    .filter((v) => typeof v === 'string');

  sheet.eachRow((row, rowIndex) => {
    if (rowIndex > 1) {
      const object: Record<string, any> = { uuid: uuid() };
      row.eachCell((cell, colIndex) => {
        // 这里的colIndex是从1开始的，所以数组取值需要减1
        const k = keys[colIndex - 1];
        if (k) {
          if (
            typeof cell.value === 'boolean' ||
            typeof cell.value === 'number'
          ) {
            object[k] = cell.value;
          } else {
            object[k] = cell.text || '';
          }
        }
      });
      keys.forEach((property) => {
        if (property) {
          if (!Object.prototype.hasOwnProperty.call(object, property))
            object[property] = '';
        }
      });
      array.push(object);
    }
  });
  return array;
}

function setColumnKey(sheet: Worksheet): Worksheet {
  const headRow = sheet.getRow(1);
  headRow.eachCell((cell, colNumber) => {
    if (cell.text) {
      const keys = cell.text.split('|');
      sheet.getColumn(colNumber).key = keys[0] || keys[1];
    }
  });
  return sheet;
}

export function workbook2map(workbook: Workbook): WorkbookMap {
  const map: WorkbookMap = new Map();
  workbook.eachSheet((sheet) => {
    const sheetKey = sheet.name.split('|')[0] as SheetName;
    if (sheetKey) map.set(sheetKey, sheet2json(sheet));
  });
  return map;
}
