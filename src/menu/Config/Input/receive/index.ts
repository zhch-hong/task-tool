import Vue from 'vue';
import { Button, Dialog } from 'element-ui';
import appendRow from '..';

import Receive from './Receive.vue';

const EVENT_NAME = 'receive';
const REF = 'Receive';

const obser = Vue.observable({ visible: false });
const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '任务获得类型',
          visible: obser.visible,
          modal: false,
          'close-on-click-modal': false,
          'close-on-press-escape': false,
          'custom-class': 'el-dialog__custom-class',
        },

        on: {
          'update:visible': (visible: boolean) => {
            obser.visible = visible;
          },
        },
      },
      [
        h(Receive, { ref: REF }),
        h('template', { slot: 'footer' }, [
          h(Button, {
            props: { size: 'small', type: 'primary' },
            domProps: { innerText: '添加配置' },
            on: {
              click: () => {
                appendRow.open(EVENT_NAME);
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

export function receive() {
  obser.visible = true;

  appendRow.vm.$off(EVENT_NAME);

  appendRow.vm.$on(EVENT_NAME, (params: Record<string, string>) => {
    (instance.$refs[REF] as any).insertRow(params);
  });
}
