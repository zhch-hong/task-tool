import Vue from 'vue';
import { Button, Dialog } from 'element-ui';

import AppendRow from './AppendRow.vue';

let eventName = '';
const vm = new Vue();
const obser = Vue.observable({ visible: false });
const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '新增配置',
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
        h(AppendRow, { ref: 'AppendRow' }),
        h('template', { slot: 'footer' }, [
          h(Button, {
            props: { size: 'small', type: 'primary' },
            domProps: { innerText: '保存配置' },
            on: {
              click: () => {
                const data = (this.$refs.AppendRow as any).getData();
                obser.visible = false;
                vm.$emit(eventName, data);
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

export { receive } from './receive';
export { enumerate } from './enumerate';
export { asset } from './asset';

export default {
  open: (value: string) => {
    eventName = value;
    obser.visible = true;
  },
  vm: vm,
};
