import Vue from 'vue';
import { Dialog } from 'element-ui';

import Source from './Source.vue';

const obser = Vue.observable({ visible: false });
const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '来源管理',
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
      [h(Source)]
    );
  },
});

const instance = new ComponentClass();
const div = document.createElement('div');
document.body.append(div);
instance.$mount(div);

export function sourceManage() {
  obser.visible = true;
}
