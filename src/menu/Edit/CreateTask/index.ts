import Vue from 'vue';
import mousetrap from 'mousetrap';
import { Button, Dialog } from 'element-ui';

import CreateTask from './CreateTask.vue';

const obser = Vue.observable({ visible: false });

mousetrap.bind('ctrl+n', createTask, 'keydown');

const ComponentClass = Vue.extend({
  render(h) {
    return h(
      Dialog,
      {
        props: {
          title: '任务编辑',
          visible: obser.visible,
          modal: false,
          top: '10vh',
          'show-close': false,
          'close-on-click-modal': false,
          'close-on-press-escape': false,
          'custom-class': 'el-dialog__custom-class',
          width: '60%',
        },

        on: {
          'update:visible': (visible: boolean) => {
            obser.visible = visible;
          },

          opened: () => {
            const object = this.$refs.CreateTask as any;
            object
              .getUpdateTaskData()
              .then(() => {
                object.bindKeyboard();
                object.getNocontaminated();
              })
              .catch(() => {
                //
              });
          },
        },
      },
      [
        h(CreateTask, { ref: 'CreateTask' }),
        h('template', { slot: 'footer' }, [
          h(Button, {
            props: { size: 'small' },
            domProps: { innerText: '取消' },
            on: {
              click: () => {
                const object = this.$refs.CreateTask as any;
                object
                  .beforeClose()
                  .then(() => {
                    object.unBindKeyboard();
                    obser.visible = false;
                  })
                  .catch(() => {
                    //
                  });
              },
            },
          }),
          h(Button, {
            props: { size: 'small', type: 'primary' },
            domProps: { innerText: '保存任务' },
            on: {
              click: () => {
                const object = this.$refs.CreateTask as any;
                object
                  .handleSave()
                  .then(() => {
                    obser.visible = false;
                  })
                  .catch(() => {
                    //
                  });
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

export function createTask() {
  obser.visible = true;
}
