import Vue from 'vue';
import { Button, Dialog } from 'element-ui';

import File from './File.vue';

const obser = Vue.observable({ visible: false });
const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '文件管理',
          visible: obser.visible,
          modal: false,
          'close-on-click-modal': false,
          'show-close': true,
          'close-on-press-escape': false,
          'destroy-on-close': true,
          'custom-class': 'el-dialog__custom-class',
          width: '80%',
        },

        on: {
          'update:visible': (visible: boolean) => {
            obser.visible = visible;
          },
        },
      },
      [
        h(File, {
          ref: 'File',
        }),
        h('template', { slot: 'footer' }, [
          h(Button, {
            props: { size: 'small' },
            domProps: { innerText: '取消' },
            on: {
              click: () => {
                obser.visible = false;
              },
            },
          }),
          h(Button, {
            props: {
              size: 'small',
              type: 'primary',
            },
            domProps: { innerText: '应用' },

            on: {
              click: () => {
                (this.$refs.File as any).handleSave();
                obser.visible = false;
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

export function fileManage() {
  obser.visible = true;
}
