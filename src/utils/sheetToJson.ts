import { SheetName, WorkbookMap } from '@/shims-type';
import { Workbook, Worksheet } from 'exceljs';
import { v4 as uuid } from 'uuid';

export function sheet2json(sheet: Worksheet): Record<string, string>[] {
  // 判断列是否设置了key，如果第一列有，那么所有列都有
  const column = sheet.getColumn(1);
  if (!column.key) sheet = setColumnKey(sheet);

  const keys = sheet.columns.map((column) => column.key).filter((v) => typeof v === 'string');

  const array: Record<string, string>[] = [];
  sheet.eachRow((row, rowIndex) => {
    if (rowIndex > 1) {
      const object: Record<string, any> = { uuid: uuid(), _style: {} };
      row.eachCell((cell, colIndex) => {
        // 这里的colIndex是从1开始的，所以数组取值需要减1
        const k = keys[colIndex - 1];
        if (k) {
          if (typeof cell.value === 'boolean') {
            object[k] = cell.value;
          } else {
            if (k === 'base_temp' || k === 'process_temp' || k === 'source_temp') {
              object[k] = cell.text.split('|')[0];
            } else {
              object[k] = cell.text || '';
            }
          }

          // 记录每个单元格（字段值）的样式
          object['_style'][k] = cell.style;
        }
      });
      keys.forEach((property) => {
        if (property) {
          if (!Object.prototype.hasOwnProperty.call(object, property)) object[property] = '';
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
