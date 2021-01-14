<template>
  <div>
    <div ref="treeLabel" @contextmenu.prevent="contextmenu">
      <slot></slot>
    </div>
    <ul v-if="treeData.type === 'name'" ref="contextMenu" class="content-menu">
      <!-- 根节点 -->
      <template v-if="treeData.type === 'name'">
        <li @click.stop="onclickNode('remove')">删除模板</li>
      </template>
    </ul>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import { TreeData, TreeNode } from 'element-ui/types/tree';

import tippy, { followCursor, Instance } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

interface TreeMeta extends TreeData {
  uuid?: string;
  type?: string;
}

export default Vue.extend({
  name: 'NodeItem',

  props: {
    treeNode: {
      type: Object as PropType<TreeNode<string, TreeMeta>>,
      required: true,
    },
    treeData: {
      type: Object as PropType<TreeMeta>,
      required: true,
    },
  },

  data() {
    return {
      tippyInstance: null as Instance | null,
    };
  },

  mounted() {
    if (this.treeData.type === 'name') {
      this.initPopper();
    }
  },

  methods: {
    contextmenu() {
      if (this.treeData.type !== 'name') {
        return;
      }

      if (this.tippyInstance !== null) {
        this.tippyInstance.show();
      }
    },

    onclickNode(value: string) {
      if (this.tippyInstance !== null) {
        this.tippyInstance.hide();
        this.$emit(value);
      }
    },

    initPopper(): void {
      const element = this.$refs.treeLabel as Element;
      this.tippyInstance = tippy(element, {
        content: this.$refs.contextMenu as Element,
        plugins: [followCursor],
        arrow: false,
        followCursor: 'initial',
        interactive: true,
        trigger: 'manual',
        theme: 'tomato',
        placement: 'bottom-end',
      });
    },
  },
});
</script>
<style lang="scss" scoped>
.content-menu {
  box-sizing: border-box;
  min-width: 150px;
  min-height: 180px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
  z-index: 1;
  background-color: #f2f2f2;
  padding: 0;
  margin: 0;
  list-style-type: none;
  li {
    padding: 2px 8px;
    margin: 2px 0;
    font-size: 14px;
    cursor: default;
    line-height: 1.8;
    &:hover {
      background-color: white;
    }
  }
}
</style>
