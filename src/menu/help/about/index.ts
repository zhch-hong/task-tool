import Vue from 'vue';
import { Dialog } from 'element-ui';
import About from './About.vue';

const obser = Vue.observable({ visible: false });
const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '任务配置工具',
          visible: obser.visible,
          modal: false,
          width: '30%',
          'close-on-click-modal': false,
          'custom-class': 'el-dialog__custom-class',
        },

        on: {
          'update:visible': (visible: boolean) => {
            obser.visible = visible;
          },
        },
      },
      [h(About)]
    );
  },
});

const instance = new ComponentClass();
const div = document.createElement('div');
document.body.append(div);
instance.$mount(div);

export function about() {
  obser.visible = true;
}
