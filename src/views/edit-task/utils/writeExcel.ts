import store from '@/store';
import { Worksheet } from 'exceljs';

import { getRowByColumnValue } from '@/utils';
import { readLastFile } from '@/asserts/readLastFile';
import { WorkbookMap } from '@/shims-vue';

// 从小到大缺失的id，供添加任务时使用
const lostTaskid: string = store.getters.taskid();
const lostProcessid: string = store.getters.processid();
const lostSourceid: string = store.getters.sourceid();
const lostAwardid: () => string = store.getters.awardid;
const lostConditionid: () => string = store.getters.conditionid;

let path = store.state.taskFilePath;
const updateTaskid = store.state.updateTaskId;
/** 操作模式，是修改任务，还是添加任务 */
let activeModel: 'update' | 'create' = 'update';

// 如果vuex中没有存taskid，说明当前是添加任务，那么taskid就取从小到大缺失的id
if (updateTaskid === '') {
  activeModel = 'create';
}
if (store.state.taskFilePath === '') {
  readLastFile().then((_path) => {
    if (_path) path = _path;
  });
}

export function writeExcel(data: Record<string, any>) {
  const workbookMap = store.getters.workbookMap();
  const base: Record<string, any> = data.base;
  const process: Record<string, any> = data.process;
  const source: Record<string, any>[] = data.source;

  writeBase(workbookMap, base);
  writeProgress(workbookMap, process);
  writeSource(workbookMap, source);

  store.commit('workbookMap', workbookMap);

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
  data: Record<string, any>[]
): void {
  console.log('source', JSON.parse(JSON.stringify(data)));

  let source_id = lostSourceid;
  data.find((sourceItem) => {
    const source: Record<string, string> = sourceItem.source;
    if (source.source_id) {
      source_id = source.source_id;
      return true;
    }
    return false;
  });

  const sourceList = workbookMap.get('source') as Record<string, string>[];
  const conditionList = workbookMap.get('condition') as Record<
    string,
    string
  >[];

  data.forEach((sourceItem: Record<string, any>) => {
    const source: Record<string, string> = sourceItem.source;
    source.source_id = source_id;
    deleteExisting(sourceList, 'source_id', source_id);
    sourceList.push(source);

    const condition_id = source.condition_id || lostConditionid();
    deleteExisting(conditionList, 'condition_id', condition_id);

    const conditionArray: Record<string, string>[] = sourceItem.condition;
    conditionArray.forEach((cond) => (cond.condition_id = condition_id));
    conditionList.push(...conditionList);
  });
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
