import Vue from 'vue';

import ProgressBar from './ProgressBar.vue';

Vue.use({
  install: (Vue) => {
    let instance: Vue | null = null;
    let status: 'mounted' | 'unmount' = 'unmount';

    Vue.prototype.$progressbar = {
      show: () => {
        if (status === 'mounted') {
          return;
        }

        const main = document.getElementById('main');

        if (main) {
          const div = document.createElement('div');
          main.insertBefore(div, null);
          instance = new ProgressBar();
          instance.$mount(div);
          status = 'mounted';
        }
      },

      hide: () => {
        if (status === 'unmount') {
          return;
        }

        const main = document.getElementById('main');

        if (main) {
          if (instance !== null) {
            instance.$el.remove();
            instance.$destroy();
            instance = null;
            status = 'unmount';
          }
        }
      },
    };
  },
});
