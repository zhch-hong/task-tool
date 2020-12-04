import store from '@/store';
import { writeFileSync } from 'fs';
import { CellValue, Workbook, Worksheet } from 'exceljs';

import { sheetToJson } from '@/utils/sheetToJson';
import { writeFile } from '@/utils/fileStream';
import { strValToNumber } from './parseNumberValue';

const path = store.state.taskFilePath;
const workbook = store.state.workbook as Workbook;
const taskid = store.state.updateTaskId;

export function writeExcel(data: Record<string, any>) {
  const base: Record<string, any> = data.base;
  const progress: Record<string, any> = data.progress;
  const source: Record<string, any>[] = data.source;

  writeBase(base);
  writeProgress(progress);
  writeSource(source);

  workbook.xlsx.writeBuffer().then((buffer) => {
    writeFileSync(path, new Uint8Array(buffer));
  });
}

function writeBase(data: Record<string, any>) {
  const ws = workbook.getWorksheet('task');
  const rowData = getRowByColumnValue(ws, 'id', taskid);
  const row = rowData.row as Record<string, CellValue>;
  const rowNumber = rowData.rowNumber as number;
  row['任务内容说明'] = data.desc;
  delete data.desc;
  Object.assign(row, data);

  if (
    typeof row.start_valid_time === 'string' &&
    typeof row.end_valid_time === 'string'
  ) {
    row.start_valid_time = parseInt(row.start_valid_time);
    row.end_valid_time = parseInt(row.end_valid_time);
  }

  ws.spliceRows(rowNumber, 1);
  ws.insertRow(rowNumber, row);
}

function writeProgress(data: Record<string, any>) {
  const taskSheet = workbook.getWorksheet('task');
  const taskRowData = getRowByColumnValue(taskSheet, 'id', taskid);
  const taskRow = taskRowData.row as Record<string, CellValue>;

  const processid = taskRow.process_id as number;
  const processSheet = workbook.getWorksheet('process_data');
  const processRowData = getRowByColumnValue(
    processSheet,
    'process_id',
    processid.toString()
  );

  const processRow = processRowData.row;
  const processRowNumber = processRowData.rowNumber;

  /**
   * process_data表
   */

  // 新的数据行
  const processInsertRow: Record<string, any> = {};

  processInsertRow.process_id = processid;
  processInsertRow.condition_type = processRow.condition_type
    ? (processRow.condition_type as string)
    : null;
  processInsertRow.source_id = processRow.source_id
    ? (processRow.source_id as number)
    : null;
  processInsertRow.condition_id = processRow.condition_id
    ? (processRow.condition_id as number)
    : null;
  processInsertRow.pre_add_process = data.preProcess
    ? parseFloat(data.preProcess as string)
    : null;
  processInsertRow.get_award_type = data.rewardType
    ? (data.rewardType as string)
    : null;
  processInsertRow.is_auto_get_award = processRow.is_auto_get_award || null;

  // 进度间隔表
  const processArray = data.lineData.map((line: Record<string, any>) => {
    return parseInt(line.process);
  });
  if (processArray.length > 0 && data.lastLoop) processArray.push(-1);
  processInsertRow.process = processArray.join(',') || null;

  // 奖励表
  const newAwards: string[] = data.lineData
    .map((line: Record<string, any>) => {
      if (line.awardId) {
        return parseInt(line.awardId);
      } else {
        if (line.awards.length > 0) return parseInt(line.awards[0].award_id);
        return '';
      }
    })
    .filter((item: string) => item !== '');
  processInsertRow.awards = newAwards.join(',') || null;

  processSheet.spliceRows(processRowNumber, 1);
  processSheet.insertRow(processRowNumber, processInsertRow);

  /**
   * award_data表
   */
  const awardSheet = workbook.getWorksheet('award_data');
  data.lineData.forEach((line: Record<string, any>) => {
    if (line.awards.length > 0) {
      const id: string = line.awards[0].award_id;
      deleteExisting(awardSheet, 'award_id', parseInt(id));
    }

    const insertRows: Record<
      string,
      any
    >[] = line.awards.map((award: Record<string, any>) =>
      strValToNumber(award)
    );
    if (insertRows.length > 0) {
      const awardId: number = insertRows[0].award_id;
      const insertIndex =
        getInsertIndex(awardSheet, 'award_id', awardId - 1) + 1;

      awardSheet.insertRows(insertIndex, insertRows);
    }
  });
}

function writeSource(data: Record<string, any>[]): void {
  console.log(data);
  /**
   * 根据taskid找到数据行
   */
  const taskSheet = workbook.getWorksheet('task');
  const taskRowData = getRowByColumnValue(taskSheet, 'id', taskid);
  const taskRow = taskRowData.row as Record<string, CellValue>;

  /**
   * 找到process_id，再去process_data表中找到对应数据行
   */
  const processid = taskRow.process_id as number;
  const processSheet = workbook.getWorksheet('process_data');
  const processRowData = getRowByColumnValue(
    processSheet,
    'process_id',
    processid.toString()
  );
  const processRow = processRowData.row;

  /**
   * source表
   */
  const sourceId = processRow.source_id as number;
  const sourceSheet = workbook.getWorksheet('source');
  deleteExisting(sourceSheet, 'source_id', sourceId);

  if (data.length > 0) {
    const sourceId = parseInt(data[0].source_id);
    const insertIndex =
      sourceId === 1
        ? 2
        : getInsertIndex(sourceSheet, 'source_id', sourceId - 1);
    const insertRows = data.map((item) => strValToNumber(item));
    sourceSheet.insertRows(insertIndex, insertRows);
  }

  /**
   * condition表
   */
  const conditionSheet = workbook.getWorksheet('condition');
  data.forEach((source) => {
    if (source.condition_id) {
      deleteExisting(
        conditionSheet,
        'condition_id',
        parseInt(source.condition_id)
      );
    }
  });
  data.forEach((source) => {
    const insertRows: Record<
      string,
      any
    >[] = source.conditionList.map((cond: Record<string, any>) =>
      strValToNumber(cond)
    );
    if (insertRows.length > 0) {
      const id = insertRows[0].condition_id as number;
      const insertIndex = getInsertIndex(
        conditionSheet,
        'condition_id',
        id - 1
      );
      conditionSheet.insertRows(insertIndex, insertRows);
    }
  });
}

function getRowByColumnValue(ws: Worksheet, col: string, value: string) {
  const rowData: Record<string, CellValue> = {};
  const object = {
    row: rowData,
    rowNumber: -1,
  };
  console.log('getRowByColumnValue');
  ws.eachRow((row, index) => {
    console.log('eachRow');
    const cell = row.getCell(col);
    if (cell.text === value) {
      object.rowNumber = index;
      const row = ws.getRow(index);
      row.eachCell((cell, colNumber) => {
        const key = cell.worksheet.getColumn(colNumber).key;
        if (key) {
          rowData[key] = cell.value;
        }
      });
    }
  });
  return object;
}

/**
 * 删除现有的奖励行数据方法，递归删除
 * @param sheet
 * @param col
 * @param id
 */
function deleteExisting(sheet: Worksheet, col: string, id: number) {
  const index = getRowByColumnValue(sheet, col, id.toString()).rowNumber;
  if (index !== -1) {
    sheet.spliceRows(index, 1);
    deleteExisting(sheet, col, id);
  }
}

/**
 *
 * @param sheet
 * @param col
 * @param id
 */
function getInsertIndex(sheet: Worksheet, col: string, id: number): number {
  const index = getRowByColumnValue(sheet, col, id.toString()).rowNumber;
  if (index === -1) {
    return getInsertIndex(sheet, col, id - 1);
  }
  return index + 1;
}
