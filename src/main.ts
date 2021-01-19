import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import './plugins/element-ui';
import './plugins/vxe-table';
import './plugins/progress-bar';
import './plugins/vue-notification';

import '@/asserts/initAppConfigFile';

import log from 'electron-log';

import './styles/index.scss';

Vue.config.productionTip = false;

Vue.config.errorHandler = (err, vm, info) => {
  log.error(err.message);
};

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
