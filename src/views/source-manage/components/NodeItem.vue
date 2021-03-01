<template>
  <div @contextmenu.prevent="contextmenu">
    <slot></slot>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import electron from 'electron';
import { TreeData } from 'element-ui/types/tree';

interface TreeMeta extends TreeData {
  uuid?: string;
  type?: string;
}

export default Vue.extend({
  name: 'NodeItem',

  props: {
    treeData: {
      type: Object as PropType<TreeMeta>,
      required: true,
    },
  },

  methods: {
    contextmenu() {
      const { Menu } = electron.remote;
      const menu = new Menu();

      if (this.treeData.type === 'root') {
        const c = this.generateMenuItem('添加来源', 'append');
        const d = this.generateMenuItem('删除所有来源', 'remove');
        menu.append(c);
        menu.append(d);
      } else if (this.treeData.type === 'source') {
        const u = this.generateMenuItem('编辑来源', 'update');
        const d = this.generateMenuItem('删除来源', 'delete');
        const c = this.generateMenuItem('添加条件', 'append');
        menu.append(u);
        menu.append(d);
        menu.append(c);
      } else if (this.treeData.type === 'condition') {
        const u = this.generateMenuItem('编辑条件', 'update');
        const d = this.generateMenuItem('删除条件', 'delete');
        const c = this.generateMenuItem('添加条件值', 'append');
        menu.append(u);
        menu.append(d);
        menu.append(c);
      } else if (this.treeData.type === 'value') {
        const u = this.generateMenuItem('编辑条件值', 'update');
        const d = this.generateMenuItem('删除条件值', 'delete');
        menu.append(u);
        menu.append(d);
      }

      menu.popup();
    },

    generateMenuItem(label: string, type: string) {
      const { MenuItem } = electron.remote;
      return new MenuItem({
        label,
        click: () => {
          this.$emit(type);
        },
      });
    },
  },
});
</script>
