import Vue from 'vue';
import Vuex from 'vuex';

import { userdir } from '@/asserts/userdir';

Vue.use(Vuex);

interface State {
  updateTaskId: string | number;
  copyTaskList:
    | Record<string, Record<string, string> | Record<string, string>[]>[]
    | null;
  windowHeight: number;
  taskTableScroll: Record<string, number> | null;
}

const state: State = {
  updateTaskId: '',
  copyTaskList: null,
  windowHeight: 800,
  taskTableScroll: null,
};

export default new Vuex.Store({
  state: state,
  mutations: {
    updateTaskId: (state, id) => {
      state.updateTaskId = id;
    },
    copyTaskList: (state, list) => {
      state.copyTaskList = list;
    },
    windowHeight: (state) => {
      state.windowHeight = window.innerHeight;
    },
    taskTableScroll: (state, value) => (state.taskTableScroll = value),
  },
});
