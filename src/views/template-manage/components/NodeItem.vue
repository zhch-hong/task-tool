<template>
  <div ref="treeLabel" @contextmenu.prevent="contextmenu">
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
      if (this.treeData.type !== 'name') {
        return;
      }

      const { Menu, MenuItem } = electron.remote;
      const menu = new Menu();
      const item = new MenuItem({
        label: '删除模板',
        click: () => {
          this.$emit('remove');
        },
      });

      menu.append(item);
      menu.popup();
    },
  },
});
</script>
