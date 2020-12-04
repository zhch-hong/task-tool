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
  console.log(data);
  const taskSheet = workbook.getWorksheet('task');
  const taskRowData = getRowByColumnValue(taskSheet, 'id', taskid);
  const taskRow = taskRowData.row as Record<string, CellValue>;

  /**
   * process_data表
   */
  const processid = taskRow.process_id as number;
  const processSheet = workbook.getWorksheet('process_data');
  const processRowData = getRowByColumnValue(
    processSheet,
    'process_id',
    processid.toString()
  );
  const processRow = processRowData.row;
  const processRowNumber = processRowData.rowNumber;

  // 新的数据行
  const processInsertRow: Record<string, any> = {};

  processInsertRow.process_id = processid;
  processInsertRow.condition_type = processRow.condition_type as string;
  processInsertRow.source_id = processRow.source_id as number;
  processInsertRow.condition_id = processRow.condition_id as number;
  processInsertRow.pre_add_process = parseFloat(data.preProcess as string);
  processInsertRow.get_award_type = data.rewardType as string;
  processInsertRow.is_auto_get_award = processRow.is_auto_get_award;

  // 进度间隔表
  const processArray = data.lineData.map((line: Record<string, any>) => {
    return parseInt(line.process);
  });
  if (data.lastLoop) processArray.push(-1);
  processInsertRow.process = processArray.join(',');

  // 奖励表
  processInsertRow.awards = data.lineData
    .map((line: Record<string, any>) => {
      if (line.awardId) {
        return parseInt(line.awardId);
      } else {
        if (line.awards.length > 0) return parseInt(line.awards[0].award_id);
        return '';
      }
    })
    .join(',');

  processSheet.spliceRows(processRowNumber, 1);
  processSheet.insertRow(processRowNumber, processInsertRow);

  /**
   * award_data表
   */
  const awardSheet = workbook.getWorksheet('award_data');
  data.lineData.forEach((line: Record<string, any>) => {
    // 删除现有的奖励行数据方法，递归删除
    const deleteExisting = (id: number) => {
      const index = getRowByColumnValue(awardSheet, 'award_id', id.toString())
        .rowNumber;
      console.log('删除工作表行', index);
      if (index !== -1) {
        awardSheet.spliceRows(index, 1);
        deleteExisting(id);
      }
    };

    if (line.awards.length > 0) {
      const id: string = line.awards[0].award_id;
      deleteExisting(parseInt(id));
    }

    const insertRows: Record<
      string,
      any
    >[] = line.awards.map((award: Record<string, any>) =>
      strValToNumber(award)
    );
    if (insertRows.length > 0) {
      const awardId: number = insertRows[0].award_id;
      const getInsertIndex = (id: number): number => {
        const index = getRowByColumnValue(awardSheet, 'award_id', id.toString())
          .rowNumber;
        if (index === -1) {
          return getInsertIndex(id - 1);
        }
        return index;
      };

      const insertIndex = getInsertIndex(awardId - 1) + 1;

      awardSheet.insertRows(insertIndex, insertRows);
    }
  });
}

function getRowByColumnValue(ws: Worksheet, col: string, value: string) {
  const rowData: Record<string, CellValue> = {};
  const object = {
    row: rowData,
    rowNumber: -1,
  };
  ws.eachRow((row, index) => {
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
