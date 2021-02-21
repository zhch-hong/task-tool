import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { SheetName, WorkbookMap } from '@/shims-type';
import Vue from 'vue';
import store from '@/store';

function getLostid(map: WorkbookMap, name: SheetName, key: string) {
  const workbook = map;
  const sheetName = name;
  const sheet = workbook.get(sheetName);
  if (!sheet) {
    Vue.notify({
      group: 'app',
      type: 'error',
      title: `无效的${name}表`,
      text: `请检查该文件的配置表是否完备`,
    });
    throw new Error();
  }

  let existing: number[] = sheet.map((item) => parseInt(item[key]));

  // 长度为0说明一条数据也没有，设置一个默认ID
  if (existing.length === 0) {
    existing.push(0);
  }

  existing = [...new Set(existing)];
  existing.sort((a, b) => a - b);

  const maxId = existing[existing.length - 1];

  // const lostIdArray: number[] = [];
  // let length = lostIdArray.length;
  // existing.forEach((v, i) => {
  //   length = lostIdArray.length;
  //   while (v - (i + length) > 1) {
  //     length = lostIdArray.push(i + length + 1);
  //   }
  // });

  return {
    // array: lostIdArray.map((v) => v.toString()),
    array: [],
    max: maxId,
  };
}

@Module({ dynamic: true, store, name: 'lostId' })
class LostId extends VuexModule {
  private lostTaskid: string[] = [];
  private maxTaskid = -1;
  private lostProcessid: string[] = [];
  private maxProcessid = -1;
  private lostSourceid: string[] = [];
  private maxSourceid = -1;
  private lostConditionid: string[] = [];
  private maxConditionid = -1;
  private lostAwardid: string[] = [];
  private maxAwardid = -1;

  @Mutation
  private SET_LOST_ID(map: Map<SheetName, Record<string, string>[]>): void {
    const task = getLostid(map, 'task', 'id');
    this.lostTaskid = task.array;
    this.maxTaskid = task.max;

    const process = getLostid(map, 'process_data', 'process_id');
    this.lostProcessid = process.array;
    this.maxProcessid = process.max;

    const source = getLostid(map, 'source', 'source_id');
    this.lostSourceid = source.array;
    this.maxSourceid = source.max;

    const condition = getLostid(map, 'condition', 'condition_id');
    this.lostConditionid = condition.array;
    this.maxConditionid = condition.max;

    const award = getLostid(map, 'award_data', 'award_id');
    this.lostAwardid = award.array;
    this.maxAwardid = award.max;
  }

  @Action
  public setLostId(map: Map<SheetName, Record<string, string>[]>): void {
    this.SET_LOST_ID(map);
  }

  @Mutation
  public PROGRESS_TASK_ID(): void {
    this.maxTaskid++;
  }

  @Mutation
  public PROGRESS_PROCESS_ID(): void {
    this.maxProcessid++;
  }

  @Mutation
  public PROGRESS_SOURCE_ID(): void {
    this.maxSourceid++;
  }

  @Mutation
  public PROGRESS_CONDITION_ID(): void {
    this.maxConditionid++;
  }

  @Mutation
  public PROGRESS_AWARD_ID(): void {
    this.maxAwardid++;
  }

  public get taskid() {
    return (): string => {
      const id = this.lostTaskid.shift();
      if (id) return id;
      return this.maxTaskid.toString();
    };
  }

  public get processid() {
    return (): string => {
      const id = this.lostProcessid.shift();
      if (id) return id;
      return this.maxProcessid.toString();
    };
  }

  public get sourceid() {
    return () => {
      const id = this.lostSourceid.shift();
      if (id) return id;
      return this.maxSourceid.toString();
    };
  }

  public get conditionid() {
    return () => {
      const id = this.lostConditionid.shift();
      if (id) return id;
      return this.maxConditionid.toString();
    };
  }

  public get awardid() {
    return () => {
      const id = this.lostAwardid.shift();
      if (id) return id;
      return this.maxAwardid.toString();
    };
  }
}

export const LostIdModule = getModule(LostId);

export function getLostTaskId() {
  LostIdModule.PROGRESS_TASK_ID();
  return LostIdModule.taskid();
}

export function getLostProcessId() {
  LostIdModule.PROGRESS_PROCESS_ID();
  return LostIdModule.processid();
}

export function getLostSourceId() {
  LostIdModule.PROGRESS_SOURCE_ID();
  return LostIdModule.sourceid();
}

export function getLostConditionId() {
  LostIdModule.PROGRESS_CONDITION_ID();
  return LostIdModule.conditionid();
}

export function getLostAwardId() {
  LostIdModule.PROGRESS_AWARD_ID();
  return LostIdModule.awardid();
}
