import store from '@/store';

import { deleteExisting, stringify } from '@/utils';
import { writeMapToExcel } from '@/utils/cutoverExcelMap';
import { WorkbookMap } from '@/shims-vue';
import { updateBase, updateProcess, updateSource } from '@/utils';

// 从小到大缺失的id，供添加任务时使用
let lostTaskid = '';
let lostProcessid = '';
let lostSourceid = '';
const lostAwardid: () => string = store.getters.awardid;
const lostConditionid: () => string = store.getters.conditionid;

let updateTaskid: string | number = '';
/** 操作模式，是修改任务，还是添加任务 */
let activeModel: 'update' | 'create' = 'update';

export function writeExcel(data: Record<string, any>) {
  lostTaskid = store.getters.taskid();
  lostProcessid = store.getters.processid();
  lostSourceid = store.getters.sourceid();

  updateTaskid = store.state.updateTaskId;
  if (updateTaskid === '') {
    activeModel = 'create';
  }

  console.log(stringify(data));

  const workbookMap = store.getters.workbookMap();
  const base: Record<string, any> = data.base;
  const process: Record<string, any> = data.process;
  const source: Record<string, any>[] = data.source;

  const { baseTempid, processTempid, sourceTempid } = data;
  const template = { baseTempid, processTempid, sourceTempid };

  writeBase(workbookMap, base, template);
  writeProgress(workbookMap, process);
  writeSource(workbookMap, source);

  store.commit('workbookMap', workbookMap);

  writeMapToExcel(workbookMap);
}

function writeBase(
  workbookMap: WorkbookMap,
  data: Record<string, any>,
  template: Record<string, string | undefined>
) {
  const taskList = workbookMap.get('task') as Record<string, string>[];
  const { baseTempid, processTempid, sourceTempid } = template;

  if (activeModel === 'update') {
    lostTaskid = data.id;
    lostProcessid = data.process_id;

    const index = taskList.findIndex(
      (item) => item.id.toString() === updateTaskid.toString()
    );
    if (index !== -1) {
      data['base_temp'] = baseTempid || taskList[index].base_temp;
      data['process_temp'] = processTempid || taskList[index].process_temp;
      data['source_temp'] = sourceTempid || taskList[index].source_temp;
      taskList.splice(index, 1, data);
    }
  } else {
    data['base_temp'] = baseTempid || null;
    data['process_temp'] = processTempid || null;
    data['source_temp'] = sourceTempid || null;
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
      const old = awards.find(
        (awa) => typeof awa.award_id !== 'undefined' && awa.award_id !== ''
      );
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
  console.log(process.awards);

  const processList = workbookMap.get('process_data') as Record<
    string,
    string
  >[];
  if (activeModel === 'create') {
    process.process_id = lostProcessid;
    process.source_id = lostSourceid;
    processList.push(process);
  } else {
    lostSourceid = process.source_id;
    const index = processList.findIndex(
      (proc) => proc.process_id.toString() === process.process_id.toString()
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
  const sourceList = workbookMap.get('source') as Record<string, string>[];
  const conditionList = workbookMap.get('condition') as Record<
    string,
    string
  >[];

  deleteExisting(sourceList, 'source_id', lostSourceid);
  // 查找需要删除的id
  let delSourceid: string | number = '';
  const delConditionid: string | number[] = [];
  data.forEach((item) => {
    if (item.source.source_id) delSourceid = item.source.source_id;

    const condition = item.condition.find(
      (cond: Record<string, string | number>) => {
        return (
          typeof cond.condition_id !== 'undefined' && cond.condition_id !== ''
        );
      }
    );
    if (condition) {
      delConditionid.push(condition.condition_id);
    }
  });
  if (delSourceid !== '') {
    deleteExisting(sourceList, 'source_id', delSourceid);
  }
  if (delConditionid.length !== 0) {
    delConditionid.forEach((id) => {
      deleteExisting(conditionList, 'condition_id', id);
    });
  }

  let source_id = lostSourceid;
  data.find((sourceItem) => {
    const source: Record<string, string> = sourceItem.source;
    if (typeof source.source_id !== 'undefined' && source.source_id !== '') {
      source_id = source.source_id;
      return true;
    }
    return false;
  });

  data.forEach((sourceItem: Record<string, any>) => {
    let condition_id = '';
    const source: Record<string, string> = sourceItem.source;
    const conditionArray: Record<string, string>[] = sourceItem.condition;
    conditionArray.find((condItem) => {
      if (
        typeof condItem.condition_id !== 'undefined' &&
        condItem.condition_id !== ''
      ) {
        condition_id = condItem.condition_id;
        return true;
      }
      return false;
    });
    if (condition_id === '') condition_id = lostConditionid();

    source.source_id = source_id;
    source.condition_id = condition_id;
    sourceList.push(source);

    conditionArray.forEach((cond) => (cond.condition_id = condition_id));
    conditionList.push(...conditionArray);
  });
}
