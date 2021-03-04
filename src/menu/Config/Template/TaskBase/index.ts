import Vue from 'vue';
import { Button, Dialog } from 'element-ui';

import TaskBase from './TaskBase.vue';

const obser = Vue.observable({ visible: false });
const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '任务基础数据',
          visible: obser.visible,
          modal: false,
          'close-on-click-modal': false,
          'close-on-press-escape': false,
          'destroy-on-close': true,
          'custom-class': 'el-dialog__custom-class',
        },

        on: {
          'update:visible': (visible: boolean) => {
            obser.visible = visible;
          },
        },
      },
      [
        h(TaskBase, { ref: 'TaskBase' }),
        h('template', { slot: 'footer' }, [
          h(Button, {
            props: { size: 'small', type: 'primary' },
            domProps: { innerText: '应用模板数据' },
            on: {
              click: () => {
                (this.$refs.TaskBase as any).getCheckedNodes();
              },
            },
          }),
        ]),
      ]
    );
  },
});

const instance = new ComponentClass();
const div = document.createElement('div');
document.body.append(div);
instance.$mount(div);

export function taskBase() {
  obser.visible = true;
}
