import { readFileSync, writeFileSync } from 'fs';
import { Workbook, Worksheet } from 'exceljs';
import { WorkbookMap } from '@/shims-type';
import { workbook2map } from './sheetToJson';
import { parseString2Number } from '@/utils';
import { getSheet } from './likeSheet';
import { setColumnKey } from './setColumnKey';
import { MessageBox } from 'element-ui';
import { ActiveFileModule } from '@/store/modules/active-file';

/**
 * 判断task工作表是否有模板id存储列，没有则添加
 * @param sheet
 */
function addTemplateCol(sheet: Worksheet) {
  const array: string[] = [];
  sheet.getRow(1).eachCell((cell) => array.push(cell.text));

  if (array.includes('|base_temp|任务数据')) return;

  const count = sheet.columnCount + 1;
  sheet.spliceColumns(count, 0, ['|base_temp|任务数据'], ['|process_temp|进度数据'], ['|source_temp|来源数据']);
}

/**
 * 判断task工作表是否存在任务内容说明列，没有则添加
 * @param sheet
 */
function descriptionColumn(sheet: Worksheet) {
  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell) => headers.push(cell.text));
  if (headers.includes('|任务内容说明')) return;

  sheet.getRow(1).splice(sheet.columnCount + 1, 0, '|任务内容说明');
}

/**
 * 向一个工作簿中添加一个工作表，并填充指定数据
 * @param workbook
 * @param json
 * @param sheet
 */
function jsonToSheet(workbook: Workbook, json: Record<string, string>[], sheet?: Worksheet) {
  if (sheet) {
    const sheetName = sheet.name;
    const columns = sheet.columns;
    const headRow = sheet.getRow(1);

    const firstRow: string[] = [];
    headRow.eachCell((cell, index) => {
      if (cell.text) firstRow.push(cell.text);
    });

    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
    });
    worksheet.columns = columns.slice(0, firstRow.length);
    worksheet.addRow(firstRow);
    json.forEach((item) => parseString2Number(item));
    const rows = worksheet.addRows(json);

    worksheet.getRow(1).eachCell((cell, index) => {
      const head = cell.toString();
      const key = head.split('|')[0];
      const name = head.split('|')[1];
      if (key || name) {
        const column = worksheet.getColumn(index);
        column.key = key || name;
      }
    });

    rows.forEach((row, index) => {
      const rowJson: Record<string, any> = json[index];
      row.eachCell({ includeEmpty: true }, (cell) => {
        const key = worksheet.getColumn(cell.col).key;
        if (key && rowJson && rowJson._style) {
          cell.style = rowJson._style[key];
        }
      });
    });
    columnOrderFill(worksheet);
  }
}

/**
 * 除task工作表之外，其他工作表含有id列的，按顺序赋值
 * @param sheet
 */
function columnOrderFill(sheet: Worksheet) {
  const name = sheet.name;
  if (name.includes('task')) return;

  let count = sheet.rowCount;

  const column = sheet.getColumn(1);

  const values: Array<number | string> = [];

  while (count--) {
    values.unshift(count);
  }

  values[0] = column.values[1] as string;
  column.values = values;
}

export function readExcelToMap(path: string): Promise<WorkbookMap> {
  return new Promise<WorkbookMap>((resolve, reject) => {
    const buffer = readFileSync(path);
    new Workbook().xlsx
      .load(buffer)
      .then((workbook) => resolve(workbook2map(workbook)))
      .catch((error) => reject(error));
  });
}

function _writeMapToExcel(workbookMap: WorkbookMap, path?: string) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve, reject) => {
    if (!path) {
      path = ActiveFileModule.path;
    }

    if (!path) {
      reject('无效文件路径');
      return;
    }

    const buffer = readFileSync(path);
    const workbook = new Workbook();

    try {
      await workbook.xlsx.load(buffer);
    } catch (error) {
      reject(error);
      return;
    }

    const taskSheet = getSheet(workbook, 'task');
    if (taskSheet) {
      descriptionColumn(taskSheet);
      addTemplateCol(taskSheet);
    }

    setColumnKey(workbook);

    const taskList = workbookMap.get('task') as Record<string, string>[];
    const processList = workbookMap.get('process_data') as Record<string, string>[];
    const sourceList = workbookMap.get('source') as Record<string, string>[];
    const conditionList = workbookMap.get('condition') as Record<string, string>[];
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
      try {
        writeFileSync(path!, new Uint8Array(buffer));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

export function writeMapToExcel(map: WorkbookMap, path?: string) {
  return new Promise<void>((resolve, reject) => {
    _writeMapToExcel(map, path)
      .then(() => {
        resolve();
      })
      .catch(() => {
        MessageBox({
          title: '保存失败',
          message: '文件被占用，请关闭占用程序后再保存',
          type: 'warning',
          confirmButtonText: '已关闭，保存',
        })
          .then(() => {
            writeMapToExcel(map, path)
              .then(() => resolve())
              .catch(() => reject());
          })
          .catch(() => {
            resolve();
          });
      });
  });
}
