import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import './plugins/element-ui';
import './plugins/vxe-table';

import './styles/index.scss';

import '@/asserts/initAppConfigFile';

import { Notification } from 'element-ui';

Vue.config.productionTip = false;
// Vue.config.errorHandler = (err, vm, info) => {
//   console.log(err, vm, info);
//   alert(err.stack);
//   Notification({
//     title: '错误',
//     message: err.name || '',
//     type: 'error',
//     position: 'bottom-right',
//   });
// };

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
