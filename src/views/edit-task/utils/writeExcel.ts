import store from '@/store';
import { MessageBox } from 'element-ui';

import { deleteExisting, stringify, writeMapToExcel } from '@/utils';
import { WorkbookMap } from '@/shims-cust';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { LostIdModule } from '@/store/modules/lost-id';
import { ActiveFileModule } from '@/store/modules/active-file';

// 从小到大缺失的id，供添加任务时使用
let lostTaskid = '';
let lostProcessid = '';
let lostSourceid = '';
const lostAwardid: () => string = LostIdModule.awardid;
const lostConditionid: () => string = LostIdModule.conditionid;

let updateTaskid: string | number = '';
/** 操作模式，是修改任务，还是添加任务 */
let activeModel: 'update' | 'create' = 'update';

function validateTaskid(id?: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const path = ActiveFileModule.path;
    WorkspacedModule.bookMapByPath(path)
      .then((workbookMap) => {
        const list = workbookMap.get('task');
        if (list) {
          if (activeModel === 'create') {
            if (id) {
              const task = list.find(
                (item) => item.id.toString() === id.toString()
              );
              if (task) {
                MessageBox({
                  title: '重复任务ID',
                  message: `任务<strong>【${id}】</strong>已存在，继续执行可能会出现无法预料的数据错误，请确认！`,
                  type: 'error',
                  dangerouslyUseHTMLString: true,
                  closeOnClickModal: false,
                })
                  .then(() => resolve())
                  .catch(reject);
              } else {
                resolve();
              }
            } else {
              resolve();
            }
          } else {
            if (id) {
              if (id.toString() === updateTaskid.toString()) {
                resolve();
              } else {
                const task = list.find(
                  (item) => item.id.toString() === id.toString()
                );
                if (task) {
                  MessageBox({
                    title: '重复任务ID',
                    message: `任务<strong>【${id}】</strong>已存在，继续执行可能会出现无法预料的数据错误，请确认！`,
                    type: 'error',
                    dangerouslyUseHTMLString: true,
                    closeOnClickModal: false,
                  })
                    .then(() => resolve())
                    .catch(reject);
                } else {
                  resolve();
                }
              }
            } else {
              resolve();
            }
          }
        } else {
          reject();
        }
      })
      .catch((error: Error) => reject(error));
  });
}

export async function writeExcel(data: Record<string, any>) {
  lostTaskid = LostIdModule.taskid();
  lostProcessid = LostIdModule.processid();
  lostSourceid = LostIdModule.sourceid();

  updateTaskid = store.state.updateTaskId;
  if (updateTaskid === '') {
    activeModel = 'create';
  }

  console.log(stringify(data));

  const path = ActiveFileModule.path;
  const workbookMap = await WorkspacedModule.bookMapByPath(path);
  const base: Record<string, any> = data.base;
  const process: Record<string, any> = data.process;
  const source: Record<string, any>[] = data.source;

  const { baseTempid, processTempid, sourceTempid } = data;
  const template = { baseTempid, processTempid, sourceTempid };

  validateTaskid(base.id)
    .then(() => {
      writeBase(workbookMap, base, template);
      writeProgress(workbookMap, process);
      writeSource(workbookMap, source);
      writeMapToExcel(workbookMap);
    })
    .catch();
}

function writeBase(
  workbookMap: WorkbookMap,
  data: Record<string, any>,
  template: Record<string, string | undefined>
) {
  const taskList = workbookMap.get('task') as Record<string, string>[];
  const { baseTempid, processTempid, sourceTempid } = template;

  if (activeModel === 'update') {
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

    // 如果创建任务时手动输入了id，则使用输入的id，否则使用自增的id
    if (!data.id) data.id = lostTaskid;

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

  // 将source工作表和condition工作表中旧的数据删除
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
    const source: Record<string, string> = sourceItem.source;

    // 来源的条件列表，包含原有的和新增的
    // 从条件列表中查找是否有包含condition_id的条件
    // 如果找到，则它是该来源原有的条件，那么就取它的condition_id赋值给该来源的其他条件
    // 如果没有找到，则说明该来源的所有条件都是新增的，则从缺失的id池中取一个，赋给该来源的所有条件
    const conditionArray: Record<string, string>[] = sourceItem.condition;
    let condition_id = '';
    if (conditionArray.length === 0) {
      // 如果条件列表的长度为0，说明该来源没有任何条件，那么就将该来源的condition_id置为0
      condition_id = '0';
    } else {
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
    }

    source.source_id = source_id;
    source.condition_id = condition_id;
    sourceList.push(source);

    conditionArray.forEach((cond) => (cond.condition_id = condition_id));
    conditionList.push(...conditionArray);
  });
}
