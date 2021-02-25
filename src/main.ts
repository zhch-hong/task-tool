import Vue from 'vue';
import { ipcRenderer } from 'electron';

Vue.config.errorHandler = (err) => {
  ipcRenderer.send('runtime-error', err);
};

import App from './App.vue';
import router from './router';
import store from './store';

import './plugins/element-ui';
import './plugins/vxe-table';
import './plugins/vue-notification';
import './plugins/custom-electron-titlebar';

import '@/assets/font/iconfont.css';

import './styles/index.scss';

Vue.config.productionTip = false;

const app = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

export { app };
