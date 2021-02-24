import store from '@/store';
import { WorkbookMap } from '@/shims-type';
import _ from 'lodash';
import { deleteExisting } from '.';
import { LostIdModule, getLostAwardId, getLostConditionId } from '@/store/modules/lost-id';

function getProcessId(workbookMap: WorkbookMap, taskid: string | number): string | undefined {
  const taskList = workbookMap.get('task') as Record<string, string>[];
  const task = taskList.find((t) => t.id.toString() === taskid.toString());
  if (task) return task.process_id.toString();
}

function getSourceId(workbookMap: WorkbookMap, taskid: string | number): string | undefined {
  const process_id = getProcessId(workbookMap, taskid);
  if (process_id) {
    const processList = workbookMap.get('process_data') as Record<string, string>[];
    const process = processList.find((p) => p.process_id.toString() === process_id);
    if (process) return process.source_id.toString();
  }
}

function updateBase(workbookMap: WorkbookMap, taskid: string | number, data: Record<string, any>) {
  const taskList = workbookMap.get('task') as Record<string, string>[];
  const index = taskList.findIndex((t) => t.id == taskid);
  if (index !== -1) {
    _.assign(taskList[index], data);
  }
}

function updateProcess(workbookMap: WorkbookMap, taskid: string | number, data: Record<string, any>) {
  const lostAwardid = getLostAwardId();

  const processList = workbookMap.get('process_data') as Record<string, string>[];
  const awardList = workbookMap.get('award_data') as Record<string, string>[];

  const process: Record<string, string> = data.process;
  const awards: Record<string, string>[][] = data.awards;

  // 将award_data表中原有的奖励数据删除
  const deleteAward: Record<string, any>[] = [];
  const processid = getProcessId(workbookMap, taskid);
  if (processid) {
    const oldProcess = processList.find((p) => p.process_id == processid);
    if (oldProcess) {
      oldProcess.awards.split(',').forEach((id) => {
        if (id !== '-1') {
          const list = deleteExisting(awardList, 'award_id', id);
          deleteAward.push(...list);
        }
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

        // 设置样式
        deleteAward.forEach((delItem) => {
          const asset_type = delItem.asset_type;
          // award_id会有多个，而他们的award_id都是相同的，只有asset_type不同，所以使用asset_type查找
          const res = item.find((_award) => _award.asset_type === asset_type);
          if (res) {
            res['_style'] = delItem._style;
          }
        });

        awardList.push(...item);
      } else {
        // 如果奖励列表数组长度为0，说明该阶段没有奖励，奖励id使用-1表示没有奖励
        _awardid = '-1';
      }

      if (index < awards.length - 1) process.awards += `${_awardid},`;
      else process.awards += `${_awardid}`;
    });

    const index = processList.findIndex((p) => p.process_id == processid);
    if (index !== -1) {
      // 设置样式
      process['_style'] = processList[index]._style;

      processList.splice(index, 1, process);
    }
  }
}

function updateSource(workbookMap: WorkbookMap, taskid: string | number, data: Record<string, any>) {
  const sourceList = workbookMap.get('source') as Record<string, string>[];
  const conditionList = workbookMap.get('condition') as Record<string, string>[];
  const source_id = getSourceId(workbookMap, taskid);
  if (source_id) {
    const filterSource = sourceList.filter((s) => s.source_id.toString() === source_id);
    const filterCondition = filterSource.map((s) => s.condition_id);

    const deleteSource: Record<string, any>[] = [];
    const deleteCondition: Record<string, any>[] = [];

    filterSource.forEach((s) => {
      const list = deleteExisting(sourceList, 'source_id', source_id);
      deleteSource.push(...list);
    });
    filterCondition.forEach((id) => {
      const list = deleteExisting(conditionList, 'condition_id', id);
      deleteCondition.push(...list);
    });

    data.source.forEach((s: Record<string, string>, i: number) => {
      const condition_id = getLostConditionId();
      s.source_id = source_id;
      s.condition_id = condition_id;

      data.condition[i].forEach((c: Record<string, string>) => (c.condition_id = condition_id));

      // 设置样式
      deleteCondition.forEach((cdt) => {
        const name = cdt.condition_name;
        const res = data.condition[i].find((_cdt: any) => _cdt.condition_name === name);
        if (res) {
          res['_style'] = cdt._style;
        }
      });

      conditionList.push(...data.condition[i]);
    });

    // 设置样式
    deleteSource.forEach((src) => {
      const res = data.source.find((_src: any) => _src.source_type === src.source_type);
      if (res) {
        res['_style'] = src._style;
      }
    });

    sourceList.push(...data.source);
  }
}

export { updateBase, updateProcess, updateSource };
