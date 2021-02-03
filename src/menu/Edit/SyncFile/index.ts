import Vue from 'vue';
import router from '@/router';
import { Button, Dialog } from 'element-ui';

import WorkspaceExcel from './WorkspaceExcel.vue';

let excelPath = '';

const obser = Vue.observable({ visible: false });
const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '打开文件',
          visible: obser.visible,
          closeOnClickModal: false,
        },

        on: {
          'update:visible': (visible: boolean) => {
            obser.visible = visible;
          },

          close: () => {
            obser.visible = false;
          },
        },
      },
      [
        h(WorkspaceExcel, {
          on: {
            'open-excel': (path: string) => {
              obser.visible = false;
              router.push(`/sync-file/${path}`);
            },

            'click-file': (path: string) => {
              excelPath = path;
            },
          },
        }),
        h('template', { slot: 'footer' }, [
          h(Button, {
            domProps: { innerText: '取消' },
            on: {
              click: () => {
                obser.visible = false;
              },
            },
          }),
          h(Button, {
            props: { type: 'primary' },
            domProps: { innerText: '确定' },
            on: {
              click: () => {
                obser.visible = false;
                router.push(`/sync-file/${excelPath}`);
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

export function syncFile() {
  obser.visible = true;
}
