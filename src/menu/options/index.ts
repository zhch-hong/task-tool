import Vue from 'vue';
import { app } from '@/main';
import Options from './index.vue';

export function options() {
  let visible = true;

  const div = document.createElement('div');
  document.body.append(div);

  const vnode = app.$createElement(Options, {
    props: {
      visible: visible,
    },

    on: {
      'update:visible': () => {
        visible = false;
        Vue.nextTick(() => {
          ins.$el.remove();
          ins.$destroy();
        });
      },
    },
  });

  const ins = new Vue({
    render: () => vnode,
  });

  ins.$mount(div);
}
