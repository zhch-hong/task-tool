import Vue from 'vue';
import { remote } from 'electron';

const { app, dialog } = remote;

// import Options from './index.vue';

// let mounted = false;

export function about() {
  dialog.showMessageBoxSync({
    title: '关于',
    message: '任务配置工具',
    detail: `版本：${app.getVersion()}`,
    type: 'info',
  });

  /* if (mounted) return;

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
          mounted = false;
        });
      },
    },
  });

  const ins = new Vue({
    render: () => vnode,
  });

  ins.$mount(div).$nextTick(() => {
    mounted = true;
  }); */
}
