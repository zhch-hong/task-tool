import Vue from 'vue';
import Vuex from 'vuex';
import { Workbook } from 'exceljs';

import { userdir } from '@/asserts/userdir';
import { SheetName } from '@/shims-vue';

import { Notification } from 'element-ui';

Vue.use(Vuex);

interface State {
  userStoragePath: string;
  taskFilePath: string;
  updateTaskId: string;
  workbook: Workbook | null;
  workbookMap: Map<SheetName, Record<string, string>[]>;
  copyTaskList:
    | Record<string, Record<string, string> | Record<string, string>[]>[]
    | null;
}

const state: State = {
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

  const lostIdArray: number[] = [];
  let length = lostIdArray.length;
  existing.forEach((v, i) => {
    length = lostIdArray.length;
    while (v - (i + length) > 1) {
      length = lostIdArray.push(i + length + 1);
    }
  });

  return {
    array: lostIdArray.map((v) => v.toString()),
    max: maxId,
  };
}

export default new Vuex.Store({
  state: state,
  mutations: {
    editFilePath: (state, path) => (state.taskFilePath = path),
    updateTaskId: (state, id) => (state.updateTaskId = id),
    workbook: (state, wb) => (state.workbook = wb),
    workbookMap: (state, map) => {
      state.workbookMap = map;
      setLostid(map);
    },
    copyTaskList: (state, list) => (state.copyTaskList = list),
  },
  actions: {
    workbook({ commit }, workbook) {
      commit('workbook', workbook);
    },
    workbookMap({ commit }, map) {
      commit('workbookMap', map);
    },
  },
  getters: {
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
