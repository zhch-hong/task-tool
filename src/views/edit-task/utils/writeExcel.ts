import store from '@/store';
import { CellValue, Worksheet } from 'exceljs';

import { strValToNumber } from './parseNumberValue';
import { getRowByColumnValue, getSheet } from '@/utils';
import { setLastFile } from '@/asserts/setOpenFile';
import { WorkbookMap } from '@/shims-vue';
import { values } from 'lodash';

// 从小到大缺失的id，供添加任务时使用
const lostTaskid: string = store.getters.taskid();
const lostProcessid: string = store.getters.processid();
const lostSourceid: string = store.getters.sourceid();
const lostAwardid: () => string = store.getters.awardid;
const lostConditionid: () => string = store.getters.conditionid;

const path = store.state.taskFilePath;
const updateTaskid = store.state.updateTaskId;
/** 操作模式，是修改任务，还是添加任务 */
let activeModel: 'update' | 'create' = 'update';

// 如果vuex中没有存taskid，说明当前是添加任务，那么taskid就取从小到大缺失的id
if (updateTaskid === '') {
  activeModel = 'create';
}
if (store.state.taskFilePath === '') {
  setLastFile();
}

export function writeExcel(data: Record<string, any>) {
  const workbookMap = store.getters.workbookMap();
  const base: Record<string, any> = data.base;
  const process: Record<string, any> = data.process;
  const source: Record<string, any>[] = data.source;

  writeBase(workbookMap, base);
  writeProgress(workbookMap, process);
  writeSource(workbookMap, source);

  // workbook.xlsx.writeBuffer().then((buffer) => {
  //   writeFileSync(path, new Uint8Array(buffer));
  //   router.push('/edit-file');
  // });
}

function writeBase(workbookMap: WorkbookMap, data: Record<string, any>) {
  const taskList = workbookMap.get('task') as Record<string, string>[];

  if (activeModel === 'update') {
    const index = taskList.findIndex((item) => item.id === updateTaskid);
    if (index !== -1) {
      taskList.splice(index, 1, data);
    }
  } else {
    data.id = lostTaskid;
    data.process_id = lostProcessid;
    taskList.push(data);
  }
}

function writeProgress(workbookMap: WorkbookMap, data: Record<string, any>) {
  const process: Record<string, string> = data.process;
  const award: Record<string, any>[] = data.award;

  const processArray: string[] = [];
  const awardArray: string[] = [];
  const awardList = workbookMap.get('award_data') as Record<string, string>[];
  award.forEach((item: Record<string, any>) => {
    processArray.push(item.process);
    const awards: Record<string, string>[] = item.awards;
    if (awards.length !== 0) {
      const old = awards.find((awa) => awa.award_id);
      if (old) {
        awards.forEach((awa) => (awa.award_id = old.award_id));
        item.award_id = old.award_id;
      } else {
        const _id = lostAwardid();
        awards.forEach((awa) => (awa.award_id = _id));
        item.award_id = _id;
      }
      awardArray.push(item.award_id);

      // award_data表
      if (activeModel === 'update') {
        deleteExisting(awardList, 'award_id', item.award_id);
      }
      awardList.push(...awards);
    }
  });

  if (data.lastLoop) processArray.push('-1');

  process.process = processArray.join(',');
  process.awards = awardArray.join(',');

  const processList = workbookMap.get('process_data') as Record<
    string,
    string
  >[];
  if (activeModel === 'create') {
    process.process_id = lostProcessid;
    process.source_id = lostSourceid;
    processList.push(process);
  } else {
    const index = processList.findIndex(
      (proc) => proc.process_id === process.process_id
    );
    if (index !== -1) {
      processList.splice(index, 1, process);
    }
  }
}

function writeSource(
  workbookMap: WorkbookMap,
  data: Record<string, any>
): void {
  console.log('source', JSON.parse(JSON.stringify(data)));
  // const sourceSheet = workbook.getWorksheet('source');

  // /**
  //  * 根据taskid找到数据行
  //  */
  // const taskSheet = getSheet(workbook, 'task');
  // if (!taskSheet) return;

  // const taskRowData = getRowByColumnValue(taskSheet, 'id', taskid.toString());
  // const taskRow = taskRowData.row;

  // if (activeModel === 'update') {
  //   /**
  //    * 找到process_id，再去process_data表中找到对应数据行
  //    */
  //   const processid = taskRow.process_id as number;
  //   const processSheet = workbook.getWorksheet('process_data');
  //   const processRowData = getRowByColumnValue(
  //     processSheet,
  //     'process_id',
  //     processid.toString()
  //   );
  //   const processRow = processRowData.row;

  //   /**
  //    * source表
  //    */
  //   const sourceId = processRow.source_id as number;
  //   deleteExisting(sourceSheet, 'source_id', sourceId);
  // }

  // if (data.length > 0) {
  //   let sourceId = parseInt(data[0].source_id);
  //   if (activeModel === 'create') {
  //     sourceId = lostSourceid;
  //   }
  //   const insertIndex = getInsertIndex(sourceSheet, 'source_id', sourceId);
  //   const insertRows = data.map((item) => {
  //     const object = strValToNumber(item);
  //     if (activeModel === 'create') {
  //       object.source_id = parseInt(sourceId.toString());
  //       object.condition_id =
  //         item.conditionList.length === 0
  //           ? null
  //           : parseInt(item.conditionList[0].condition_id);
  //     }
  //     return object;
  //   });
  //   console.log('insert source rows', insertRows);
  //   sourceSheet.insertRows(insertIndex, insertRows);
  // }

  // /**
  //  * condition表
  //  */
  // const conditionSheet = workbook.getWorksheet('condition');
  // data.forEach((source) => {
  //   if (source.condition_id) {
  //     deleteExisting(
  //       conditionSheet,
  //       'condition_id',
  //       parseInt(source.condition_id)
  //     );
  //   }
  // });
  // data.forEach((source) => {
  //   const insertRows: Record<string, any>[] = source.conditionList.map(
  //     (cond: Record<string, any>) => {
  //       const object = strValToNumber(cond);
  //       if (activeModel === 'create') {
  //         object.condition_id = parseInt(source.condition_id.toString());
  //       }
  //       return object;
  //     }
  //   );
  //   if (insertRows.length > 0) {
  //     const id = insertRows[0].condition_id as number;
  //     const insertIndex = getInsertIndex(conditionSheet, 'condition_id', id);
  //     conditionSheet.insertRows(insertIndex, insertRows);
  //     console.log('insert condition rows', insertRows);
  //   }
  // });
}

/**
 * 删除现有的奖励行数据方法，递归删除
 * @param sheet
 * @param col
 * @param id
 */
function deleteExisting(
  list: Record<string, string>[],
  col: string,
  value: number | string
) {
  const index = list.findIndex(
    (item) => item[col].toString() === value.toString()
  );
  if (index !== -1) {
    list.splice(index, 1);
    deleteExisting(list, col, value);
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
