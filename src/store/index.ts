import Vue from 'vue';
import Vuex from 'vuex';
import { Workbook } from 'exceljs';

Vue.use(Vuex);

interface State {
  taskFilePath: string;
  updateTaskId: string;
  workbook: Workbook | null;
}

const state: State = {
  taskFilePath: '',
  updateTaskId: '',
  workbook: null,
};

export default new Vuex.Store({
  state: state,
  mutations: {
    editFilePath: (state, path: string) => (state.taskFilePath = path),
    updateTaskId: (state, id: string) => (state.updateTaskId = id),
    workbook: (state, wb: Workbook) => (state.workbook = wb),
  },
});
