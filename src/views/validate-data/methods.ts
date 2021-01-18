import { WorkbookMap } from '@/shims-cust';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { deleteExisting } from '@/utils';
import { cloneDeep } from 'lodash';

function getProcessIdList(taskList: Record<string, string>[]): string[] {
  return taskList.map((t) => t.process_id.toString());
}

function filtProcess(
  processIdList: string[],
  processList: Record<string, string>[]
) {
  const sourceIdList: string[] = [];
  const awardIdList: string[] = [];

  processIdList.forEach((id) => {
    const index = processList.findIndex((p) => p.process_id == id);
    if (index !== -1) {
      sourceIdList.push(processList[index].source_id.toString());
      awardIdList.push(...processList[index].awards.split(','));
      processList.splice(index, 1);
    }
  });

  return {
    sourceIdList,
    awardIdList,
  };
}

function filtSource(
  sourceIdList: string[],
  sourceList: Record<string, string>[]
): string[] {
  const conditionIdList: string[] = [];

  sourceIdList.forEach((id) => {
    const _sourceList = sourceList.filter((source) => source.source_id == id);
    conditionIdList.push(..._sourceList.map((s) => s.condition_id));

    deleteExisting(sourceList, 'source_id', id);
  });

  return conditionIdList;
}

function filtCondition(
  conditionIdList: string[],
  conditionList: Record<string, string>[]
): void {
  conditionIdList.forEach((id) =>
    deleteExisting(conditionList, 'condition_id', id)
  );
}

function filtAward(
  awardIdList: string[],
  awardList: Record<string, string>[]
): void {
  awardIdList.forEach((id) => deleteExisting(awardList, 'award_id', id));
}

function contaminatingData(path: string): Promise<WorkbookMap> {
  return WorkspacedModule.bookMapByPath(path)
    .then((map) => {
      try {
        const _map: WorkbookMap = new Map();
        const taskList = cloneDeep(map.get('task')!);
        const processList = cloneDeep(map.get('process_data')!);
        const sourceList = cloneDeep(map.get('source')!);
        const conditionList = cloneDeep(map.get('condition')!);
        const awardList = cloneDeep(map.get('award_data')!);

        const processIdList = getProcessIdList(taskList);
        const { sourceIdList, awardIdList } = filtProcess(
          processIdList,
          processList
        );
        const conditionIdList = filtSource(sourceIdList, sourceList);
        filtCondition(conditionIdList, conditionList);
        filtAward(awardIdList, awardList);

        _map.set('task', taskList);
        _map.set('process_data', processList);
        _map.set('source', sourceList);
        _map.set('condition', conditionList);
        _map.set('award_data', awardList);

        return _map;
      } catch (error) {
        return Promise.reject(error);
      }
    })
    .catch((error) => {
      return Promise.reject(error);
    });
}

export { contaminatingData };
