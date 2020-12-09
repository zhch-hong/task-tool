import store from '@/store';
import { writeFileSync } from 'fs';
import { CellValue, Workbook, Worksheet } from 'exceljs';

import { strValToNumber } from './parseNumberValue';
import { lostIdArray } from './lostIdArray';
import { getSheet } from '@/utils/likeSheet';

// 从小到大缺失的id，供添加任务时使用
const lostTaskid = lostIdArray('task', 'id')();
const lostProcessid = lostIdArray('process_data', 'process_id')();
const lostSourceid = lostIdArray('source', 'source_id')();
const lostConditionid = lostIdArray('condition', 'condition_id')();
const lostAwardid = lostIdArray('award_data', 'award_id')();

const path = store.state.taskFilePath;
const workbook = store.state.workbook as Workbook;
let taskid = store.state.updateTaskId;
/** 操作模式，是修改任务，还是添加任务 */
let activeModel: 'update' | 'create' = 'update';

// 如果vuex中没有存taskid，说明当前是添加任务，那么taskid就取从小到大缺失的id
if (taskid === '') {
  taskid = lostTaskid.toString();
  activeModel = 'create';
}

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
  console.group('写入基础数据');
  console.log('原始数据', JSON.parse(JSON.stringify(data)));
  const ws = getSheet(workbook, 'task');
  if (!ws) return;

  const insertRow = data;

  insertRow.id = parseInt(taskid);
  insertRow.enable = 1;
  insertRow.process_id = lostProcessid;
  insertRow['任务内容说明'] = insertRow.desc;
  delete insertRow.desc;

  if (activeModel === 'update') {
    const rowData = getRowByColumnValue(ws, 'id', taskid.toString());
    const row = rowData.row as Record<string, CellValue>;
    const rowNumber = rowData.rowNumber as number;

    insertRow.enable = row.enable;
    insertRow.process_id = row.process_id;

    ws.spliceRows(rowNumber, 1);
  }

  const insertIndex = getInsertIndex(ws, 'id', parseInt(taskid));
  console.log('插入数据', JSON.parse(JSON.stringify(insertRow)));
  console.groupEnd();
  ws.insertRow(insertIndex, insertRow);
}

function writeProgress(data: Record<string, any>) {
  console.log('progress', data);
  const taskSheet = getSheet(workbook, 'task');
  if (!taskSheet) return;

  const processSheet = workbook.getWorksheet('process_data');

  let processid = lostProcessid;

  let processRow: Record<string, any> = data;
  processRow.source_id = lostSourceid;

  if (activeModel === 'update') {
    const taskRowData = getRowByColumnValue(taskSheet, 'id', taskid.toString());
    const taskRow = taskRowData.row as Record<string, CellValue>;
    processid = taskRow.process_id as number;

    const processRowData = getRowByColumnValue(
      processSheet,
      'process_id',
      processid.toString()
    );
    processRow = processRowData.row;
    const processRowNumber = processRowData.rowNumber;
    processSheet.spliceRows(processRowNumber, 1);
  }

  const insertIndex = getInsertIndex(processSheet, 'process_id', processid);

  /**
   * process_data表
   */

  // 新的数据行
  const processInsertRow: Record<string, any> = {};

  processInsertRow.process_id = parseInt(processid.toString());
  processInsertRow.condition_type = processRow.condition_type
    ? (processRow.condition_type as string)
    : null;
  processInsertRow.source_id = processRow.source_id
    ? parseInt(processRow.source_id.toString())
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
  console.log('insert process row', processInsertRow);
  processSheet.insertRow(insertIndex, processInsertRow);

  /**
   * award_data表
   */
  const awardSheet = workbook.getWorksheet('award_data');
  data.lineData.forEach((line: Record<string, any>) => {
    if (activeModel === 'update') {
      if (line.awards.length > 0) {
        const id: string = line.awards[0].award_id;
        deleteExisting(awardSheet, 'award_id', parseInt(id));
      }
    }

    const insertRows: Record<
      string,
      any
    >[] = line.awards.map((award: Record<string, any>) =>
      strValToNumber(award)
    );
    if (insertRows.length > 0) {
      if (activeModel === 'update') {
        const awardId: number = insertRows[0].award_id;
        const insertIndex =
          getInsertIndex(awardSheet, 'award_id', awardId - 1) + 1;

        awardSheet.insertRows(insertIndex, insertRows);
        console.log('insert award row', insertRows);
      } else {
        const awardId = lostAwardid;
        const insertIndex = getInsertIndex(awardSheet, 'award_id', awardId);

        console.log('insert award row', insertRows);
        awardSheet.insertRows(insertIndex, insertRows);
      }
    }
  });
}

function writeSource(data: Record<string, any>[]): void {
  console.log('source', JSON.parse(JSON.stringify(data)));
  const sourceSheet = workbook.getWorksheet('source');

  /**
   * 根据taskid找到数据行
   */
  const taskSheet = getSheet(workbook, 'task');
  if (!taskSheet) return;

  const taskRowData = getRowByColumnValue(taskSheet, 'id', taskid.toString());
  const taskRow = taskRowData.row;

  if (activeModel === 'update') {
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
    deleteExisting(sourceSheet, 'source_id', sourceId);
  }

  if (data.length > 0) {
    let sourceId = parseInt(data[0].source_id);
    if (activeModel === 'create') {
      sourceId = lostSourceid;
    }
    const insertIndex = getInsertIndex(sourceSheet, 'source_id', sourceId);
    const insertRows = data.map((item) => {
      const object = strValToNumber(item);
      if (activeModel === 'create') {
        object.source_id = parseInt(sourceId.toString());
        object.condition_id =
          item.conditionList.length === 0
            ? null
            : parseInt(item.conditionList[0].condition_id);
      }
      return object;
    });
    console.log('insert source rows', insertRows);
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
    const insertRows: Record<string, any>[] = source.conditionList.map(
      (cond: Record<string, any>) => {
        const object = strValToNumber(cond);
        if (activeModel === 'create') {
          object.condition_id = parseInt(source.condition_id.toString());
        }
        return object;
      }
    );
    if (insertRows.length > 0) {
      const id = insertRows[0].condition_id as number;
      const insertIndex = getInsertIndex(conditionSheet, 'condition_id', id);
      conditionSheet.insertRows(insertIndex, insertRows);
      console.log('insert condition rows', insertRows);
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
          rowData[key] = cell.text;
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
  let index = getRowByColumnValue(sheet, col, id.toString()).rowNumber;
  if (index === -1) {
    if (id === 0) {
      index = 1;
    } else {
      return getInsertIndex(sheet, col, id - 1);
    }
  }
  return index + 1;
}
