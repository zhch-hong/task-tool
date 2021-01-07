import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

interface State {
  updateTaskId: string | number;
  copyTaskList:
    | Record<string, Record<string, string> | Record<string, string>[]>[]
    | null;
  taskTableScroll: Record<string, number> | null;
}

const state: State = {
  updateTaskId: '',
  copyTaskList: null,
  taskTableScroll: null,
};

export default new Vuex.Store<State>({
  state: state,
  mutations: {
    updateTaskId: (state, id) => {
      state.updateTaskId = id;
    },
    copyTaskList: (state, list) => {
      state.copyTaskList = list;
    },
    taskTableScroll: (state, value) => (state.taskTableScroll = value),
  },
});
