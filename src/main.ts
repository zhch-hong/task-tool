import './styles/index.scss';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import './plugins/element-ui';
import './plugins/vxe-table';
import './plugins/progress-bar';

import '@/asserts/initAppConfigFile';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
