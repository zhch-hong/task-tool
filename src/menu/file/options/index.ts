import Vue from 'vue';
import { Dialog } from 'element-ui';

import StorageDir from './components/StorageDir.vue';
import WorkDir from './components/WorkDir.vue';

const obser = Vue.observable({ visible: false });
const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '选项',
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

          close: () => {
            obser.visible = false;
          },
        },
      },
      [h(StorageDir), h(WorkDir)]
    );
  },
});

const instance = new ComponentClass();
const div = document.createElement('div');
document.body.append(div);
instance.$mount(div);

export function options() {
  obser.visible = true;
}
