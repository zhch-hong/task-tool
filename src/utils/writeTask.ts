import store from '@/store';
import { WorkbookMap } from '@/shims-cust';
import { assign } from 'lodash';
import { deleteExisting } from '.';
import {
  LostIdModule,
  getLostAwardId,
  getLostConditionId,
} from '@/store/modules/lost-id';

function getProcessId(
  workbookMap: WorkbookMap,
  taskid: string | number
): string | undefined {
  const taskList = workbookMap.get('task') as Record<string, string>[];
  const task = taskList.find((t) => t.id.toString() === taskid.toString());
  if (task) return task.process_id.toString();
}

function getSourceId(
  workbookMap: WorkbookMap,
  taskid: string | number
): string | undefined {
  const process_id = getProcessId(workbookMap, taskid);
  if (process_id) {
    const processList = workbookMap.get('process_data') as Record<
      string,
      string
    >[];
    const process = processList.find(
      (p) => p.process_id.toString() === process_id
    );
    if (process) return process.source_id.toString();
  }
}

function updateBase(
  workbookMap: WorkbookMap,
  taskid: string | number,
  data: Record<string, any>
) {
  taskid = taskid.toString();

  const taskList = workbookMap.get('task') as Record<string, string>[];
  const index = taskList.findIndex((t) => t.id.toString() === taskid);
  if (index !== -1) {
    assign(taskList[index], data);
  }
}

function updateProcess(
  workbookMap: WorkbookMap,
  taskid: string | number,
  data: Record<string, any>
) {
  const lostAwardid = getLostAwardId();

  const processList = workbookMap.get('process_data') as Record<
    string,
    string
  >[];
  const awardList = workbookMap.get('award_data') as Record<string, string>[];

  const process: Record<string, string> = data.process;
  const awards: Record<string, string>[][] = data.awards;

  // 将award_data表中原有的奖励数据删除
  const processid = getProcessId(workbookMap, taskid);
  if (processid) {
    const oldProcess = processList.find(
      (p) => p.process_id.toString() === processid
    );
    if (oldProcess) {
      oldProcess.awards.split(',').forEach((id) => {
        if (id !== '-1') deleteExisting(awardList, 'award_id', id);
      });
    }
  }

  const sourceid = getSourceId(workbookMap, taskid);
  if (sourceid) {
    if (processid) process['process_id'] = processid;
    process['source_id'] = sourceid;
    process['awards'] = '';

    awards.forEach((item, index) => {
      let _awardid = '-1';
      if (item.length !== 0) {
        const awardid = getLostAwardId();
        _awardid = awardid;
        item.forEach((aw) => (aw.award_id = _awardid));

        awardList.push(...item);
      } else {
        // 如果奖励列表数组长度为0，说明该阶段没有奖励，奖励id使用-1表示没有奖励
        _awardid = '-1';
      }

      if (index < awards.length - 1) process.awards += `${_awardid},`;
      else process.awards += `${_awardid}`;
    });

    const index = processList.findIndex(
      (p) => p.process_id.toString() === processid
    );
    if (index !== -1) processList.splice(index, 1, process);
  }
}

function updateSource(
  workbookMap: WorkbookMap,
  taskid: string | number,
  data: Record<string, any>
) {
  const sourceList = workbookMap.get('source') as Record<string, string>[];
  const conditionList = workbookMap.get('condition') as Record<
    string,
    string
  >[];
  const source_id = getSourceId(workbookMap, taskid);
  if (source_id) {
    const filterSource = sourceList.filter(
      (s) => s.source_id.toString() === source_id
    );
    const filterCondition = filterSource.map((s) => s.condition_id);

    filterSource.forEach((s) =>
      deleteExisting(sourceList, 'source_id', source_id)
    );
    filterCondition.forEach((id) =>
      deleteExisting(conditionList, 'condition_id', id)
    );

    data.source.forEach((s: Record<string, string>, i: number) => {
      const condition_id = getLostConditionId();
      s.source_id = source_id;
      s.condition_id = condition_id;

      data.condition[i].forEach(
        (c: Record<string, string>) => (c.condition_id = condition_id)
      );
      conditionList.push(...data.condition[i]);
    });

    sourceList.push(...data.source);
  }
}

export { updateBase, updateProcess, updateSource };
