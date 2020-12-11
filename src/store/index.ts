import Vue from 'vue';
import Vuex from 'vuex';
import { Workbook } from 'exceljs';
import { cloneDeep } from 'lodash';

import { Notification } from 'element-ui';

import { userdir } from '@/asserts/userdir';
import { SheetName, WorkbookMap } from '@/shims-vue';

Vue.use(Vuex);

interface State {
  observable: Map<string, Map<string, () => void>>;
  userStoragePath: string;
  taskFilePath: string;
  updateTaskId: string;
  workbook: Workbook | null;
  workbookMap: WorkbookMap;
  copyTaskList:
    | Record<string, Record<string, string> | Record<string, string>[]>[]
    | null;
}

const state: State = {
  observable: new Map(),
  userStoragePath: userdir,
  taskFilePath: '',
  updateTaskId: '',
  workbook: null,
  workbookMap: new Map(),
  copyTaskList: null,
};

let lostTaskid: string[] = [];
let maxTaskid = -1;
let lostProcessid: string[] = [];
let maxProcessid = -1;
let lostSourceid: string[] = [];
let maxSourceid = -1;
let lostConditionid: string[] = [];
let maxConditionid = -1;
let lostAwardid: string[] = [];
let maxAwardid = -1;

function setLostid(map: Map<SheetName, Record<string, string>[]>) {
  const task = getLostid(map, 'task', 'id');
  lostTaskid = task.array;
  maxTaskid = task.max;

  const process = getLostid(map, 'process_data', 'process_id');
  lostProcessid = process.array;
  maxProcessid = process.max;

  const source = getLostid(map, 'source', 'source_id');
  lostSourceid = source.array;
  maxSourceid = source.max;

  const condition = getLostid(map, 'condition', 'condition_id');
  lostConditionid = condition.array;
  maxConditionid = condition.max;

  const award = getLostid(map, 'award_data', 'award_id');
  lostAwardid = award.array;
  maxAwardid = award.max;
}

function getLostid(
  map: Map<SheetName, Record<string, string>[]>,
  name: SheetName,
  key: string
) {
  const workbook = map;
  const sheetName = name;
  const sheet = workbook.get(sheetName);
  if (!sheet) {
    Notification({
      title: '获取工作表失败',
      message: `workbookMap中不存在${name}`,
      type: 'error',
      position: 'bottom-right',
    });
    throw new Error();
  }

  let existing: number[] = sheet.map((item) => parseInt(item[key]));

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

function runListener(
  observable: Map<string, Map<string, () => void>>,
  name: string
) {
  const methodMap = observable.get(name);
  if (methodMap) {
    methodMap.forEach((method) => method());
  }
}

export default new Vuex.Store({
  state: state,
  mutations: {
    observable: (state, payload: Record<string, string | (() => void)>) => {
      const property = payload.property as string;
      const componentName = payload.componentName as string;
      const method = payload.method as () => void;
      const value = state.observable.get(property);
      if (value) {
        const componentMethod = value.get(componentName);
        if (!componentMethod) {
          value.set(componentName, method);
        }
      } else {
        state.observable.set(property, new Map().set(componentName, method));
      }
    },
    taskFilePath: (state, path) => {
      state.taskFilePath = path;
      runListener(state.observable, 'editFilePath');
    },
    updateTaskId: (state, id) => {
      state.updateTaskId = id;
      runListener(state.observable, 'updateTaskId');
    },
    workbook: (state, wb) => {
      state.workbook = wb;
      runListener(state.observable, 'workbook');
    },
    workbookMap: (state, map: WorkbookMap) => {
      state.workbookMap = map;
      setLostid(map);
      runListener(state.observable, 'workbookMap');
    },
    copyTaskList: (state, list) => {
      state.copyTaskList = list;
      runListener(state.observable, 'copyTaskList');
    },
  },
  getters: {
    workbookMap(state) {
      return () => {
        return cloneDeep(state.workbookMap);
      };
    },
    taskid() {
      return (): string => {
        const id = lostTaskid.shift();
        if (id) return id;
        return (++maxTaskid).toString();
      };
    },
    processid() {
      return (): string => {
        const id = lostProcessid.shift();
        if (id) return id;
        return (++maxProcessid).toString();
      };
    },
    sourceid() {
      return () => {
        const id = lostSourceid.shift();
        if (id) return id;
        return (++maxSourceid).toString();
      };
    },
    conditionid() {
      return () => {
        const id = lostConditionid.shift();
        if (id) return id;
        return (++maxConditionid).toString();
      };
    },
    awardid() {
      return () => {
        const id = lostAwardid.shift();
        if (id) return id;
        return (++maxAwardid).toString();
      };
    },
  },
});
