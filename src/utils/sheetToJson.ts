import { SheetName } from '@/shims-vue';
import { Row, Workbook, Worksheet } from 'exceljs';

export function sheetToJson(worksheet: Worksheet) {
  const dataArray: Record<string, string>[] = [];
  let keys: string[] = [];
  worksheet.eachRow(function (row, rowNumber) {
    if (rowNumber == 1) {
      if (!Array.isArray(row)) {
        keys = row.values as string[];
      }
    } else {
      const rowDict = cellValueToDict(keys, row);
      dataArray.push(rowDict);
    }
  });
  return dataArray;
}

function cellValueToDict(keys: string[], row: Row) {
  const data: Record<string, any> = {};
  row.eachCell((cell, colNumber) => {
    const value = cell.toString();
    if (typeof keys[colNumber] === 'string') {
      const _key = keys[colNumber].split('|');
      const k = _key[0] || _key[1];
      data[k] = value;
    }
  });
  return data;
}

export function sheet2json(sheet: Worksheet): Record<string, string>[] {
  const column = sheet.getColumn(1);
  if (!column.key) sheet = setColumnKey(sheet);

  const array: Record<string, string>[] = [];
  const keys = sheet.columns
    .map((column) => column.key)
    .filter((v) => typeof v === 'string');

  sheet.eachRow((row, rowIndex) => {
    if (rowIndex > 1) {
      const object: Record<string, string> = {};
      row.eachCell((cell, colIndex) => {
        // 这里的colIndex是从1开始的，所以数组取值需要减1
        const k = keys[colIndex - 1];
        if (k) object[k] = cell.text || '';
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
      const key = cell.text.split('|')[0];
      sheet.getColumn(colNumber).key = key;
    }
  });
  return sheet;
}

export function workbook2map(
  workbook: Workbook
): Map<SheetName, Record<string, string>[]> {
  const map = new Map<SheetName, Record<string, string>[]>();
  workbook.eachSheet((sheet) => {
    const sheetKey = sheet.name.split('|')[0] as SheetName;
    if (sheetKey) map.set(sheetKey, sheet2json(sheet));
  });
  return map;
}
