import Vue from 'vue';
import { Button, Dialog } from 'element-ui';

import TaskSource from './TaskSource.vue';

const obser = Vue.observable({ visible: false });
const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '任务来源数据',
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
        h(TaskSource, { ref: 'TaskSource' }),
        h('template', { slot: 'footer' }, [
          h(Button, {
            props: { size: 'small', type: 'primary' },
            domProps: { innerText: '应用模板数据' },
            on: {
              click: () => {
                (this.$refs.TaskSource as any).getCheckedNodes();
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

export function taskSource() {
  obser.visible = true;
}
