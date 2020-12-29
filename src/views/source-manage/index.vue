<template>
  <div style="width: 500px; margin: 20px 0 0 20px">
    <el-tree
      :data="treeData"
      :highlight-current="true"
      :default-expand-all="false"
      @node-drop="nodeDrop"
      @node-contextmenu="nodeContextmenu"
      ref="eltree"
      draggable
      node-key="uuid"
    >
      <template #default="{ node, data }">
        <NodeItem :tree-node="node" :tree-data="data" />

        <!-- <span v-if="data.type === 'root'"
          ><i class="el-icon-s-promotion" style="margin-right: 2px"></i
          >{{ node.label }}</span
        >
        <span v-else-if="data.type === 'source'"
          ><i class="el-icon-menu" style="margin-right: 2px"></i
          >{{ node.label }}</span
        >
        <span v-else-if="data.type === 'condition'"
          ><i class="el-icon-s-operation" style="margin-right: 2px"></i
          >{{ node.label }}</span
        >
        <span v-else
          ><i class="el-icon-tickets" style="margin-right: 2px"></i
          >{{ node.label }}</span
        > -->
      </template>
    </el-tree>
    <div data-tippy-root>
      <div class="tippy-box" data-theme="tomato">
        <div class="tippy-content"></div>
      </div>
    </div>
    <ul ref="data_tippy_root" class="content-menu">
      <!-- 根节点 -->
      <template v-if="contentMenuType === 'root'">
        <li @click.stop="appendChild">添加来源</li>
        <li @click.stop="remove">删除所有来源</li>
      </template>
      <!-- 条件来源 -->
      <template v-else-if="contentMenuType === 'source'">
        <li @click.stop="update">编辑来源</li>
        <li @click.stop="remove">删除来源</li>
        <li @click.stop="appendChild">添加条件</li>
      </template>
      <!-- 条件名称 -->
      <template v-else-if="contentMenuType === 'condition'">
        <li @click.stop="update">编辑条件</li>
        <li @click.stop="remove">删除条件</li>
        <li @click.stop="appendChild">添加条件值</li>
      </template>
      <!-- 条件值 -->
      <template v-else-if="contentMenuType === 'value'">
        <li @click.stop="update">编辑条件值</li>
      </template>
    </ul>
    <UpdateNode
      :model="model"
      :visible="updateNode"
      :node="updateTreeData"
      @update:visible="(v) => (updateNode = v)"
      @submit="submit"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { TreeData, TreeNode } from 'element-ui/types/tree';
import { resolve } from 'path';
import { v4 as uuid } from 'uuid';
import { Tree } from 'element-ui';

import tippy, { followCursor, Instance } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

import { readFileText, writeFileText } from '@/utils/fileSystem';
import { getUserconfig } from '@/asserts/userconfig';

import UpdateNode from './components/UpdateNode.vue';
import NodeItem from './components/NodeItem.vue';

interface TreeMeta extends TreeData {
  uuid?: string;
  type?: string;
}

const filePath = resolve(
  getUserconfig().workDir,
  'app_config',
  'source-manage.json'
);

@Component({
  components: {
    UpdateNode,
    NodeItem,
  },
})
export default class SourceManage extends Vue {
  $refs!: {
    eltree: Tree;
    data_tippy_root: HTMLDivElement;
  };

  treeData: TreeMeta[] = [];
  model: 'append' | 'update' = 'append';
  updateNode = false;
  updateTreeNode: TreeNode<string, TreeMeta> | null = null;
  updateTreeData: TreeMeta | null = {};

  tippyInstance: Instance | null = null;
  /** 当鼠标右键点击节点时，被点击的节点属于哪种类型，root source condition value */
  contentMenuType = '';
  contentMenuNode: TreeNode<string, TreeMeta> | null = null;
  contentMenuData: TreeMeta | null = null;

  created(): void {
    this.loadTreeData();
  }

  mounted(): void {
    // this.initPopper(document.body);
    // this.tippyInstance?.destroy();
  }

  loadTreeData(): void {
    const array: TreeMeta[] = readFileText(filePath);
    let _data: TreeMeta[] = [
      {
        id: 'root',
        label: '任务来源管理',
        children: [],
      },
    ];
    if (array[0] && array[0].id === 'root') {
      _data = array;
      _data[0].label = '任务来源管理';
    } else {
      _data[0].children = array;
    }
    this.validateTree(_data);
    this.treeData = _data;
  }

  appendChild(): void {
    const node = this.contentMenuNode;
    const data = this.contentMenuData;
    this.model = 'append';
    this.updateTreeNode = node;
    this.updateTreeData = data;
    this.updateNode = true;
    this.tippyInstance?.destroy();
  }

  update(): void {
    const node = this.contentMenuNode;
    const data = this.contentMenuData;

    if (data?.id === 'root') return;

    this.model = 'update';
    this.updateTreeNode = node;
    this.updateTreeData = data;
    this.updateNode = true;
    this.tippyInstance?.destroy();
  }

  remove(): void {
    const node = this.contentMenuNode;
    const data = this.contentMenuData;

    if (data?.id === 'root') return;

    const parent = node?.parent;
    if (!parent) return;

    const children = parent.data.children || parent.data;
    if (!Array.isArray(children)) return;

    const index = children.findIndex((d) => d.id === data?.id);
    children.splice(index, 1);

    this.validateTree(this.treeData);

    writeFileText(filePath, this.treeData);
    this.tippyInstance?.destroy();
  }

  submit(node: Record<string, string>): void {
    const { value, label } = node;
    if (this.model === 'append') {
      const node = {
        id: value,
        label: label,
        uuid: uuid(),
        children: [],
      };
      this.updateTreeData?.children?.push(node);
    } else {
      const node: TreeMeta = {
        id: value,
        label: label,
        uuid: uuid(),
        children: this.updateTreeData?.children,
      };
      if (this.updateTreeNode) {
        // this.updateTreeNode.data = node; // 这样写不会生效
        Object.assign(this.updateTreeNode.data, node);
      }
    }

    this.validateTree(this.treeData);

    writeFileText(filePath, this.treeData);
  }

  nodeDrop(
    before: TreeNode<string, TreeMeta>,
    after: TreeNode<string, TreeMeta>
  ): void {
    if (before.level === 1 || after.level === 1) {
      this.loadTreeData();
    }
  }

  validateTree(data: TreeMeta[], level = 1): void {
    data.forEach((meta) => {
      if (!meta.uuid) meta.uuid = uuid();
      if (level === 1) {
        if (!meta.type) meta.type = 'root';
      } else if (level === 2) {
        if (!meta.type) meta.type = 'source';
      } else if (level === 3) {
        if (!meta.type) meta.type = 'condition';
      } else if (level === 4) {
        if (!meta.type) meta.type = 'value';
      }
      if (meta.children && meta.children.length !== 0) {
        this.validateTree(meta.children, level + 1);
      }
    });
  }

  async nodeContextmenu(
    event: MouseEvent,
    data: TreeMeta,
    node: TreeNode<string, TreeMeta>
  ): Promise<void> {
    console.log('====');

    this.$refs.eltree.setCurrentNode(data);

    const target = event.target as HTMLElement;
    this.contentMenuNode = node;
    this.contentMenuData = data;

    if (data.type) this.contentMenuType = data.type;
    this.$refs.data_tippy_root.style.display = 'block';

    await this.$nextTick();
    this.initPopper(target);
  }

  async initPopper(element: HTMLElement): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    this.tippyInstance = tippy(element, {
      content: this.$refs.data_tippy_root,
      arrow: false,
      followCursor: 'initial',
      interactive: true,
      trigger: 'manual',
      theme: 'tomato',
      placement: 'bottom-start',
      plugins: [followCursor],
      showOnCreate: true,
      onHide() {
        _this.$refs.data_tippy_root.style.display = 'none';
      },
    });
  }
}
</script>
<style lang="scss" scoped>
.content-menu {
  display: none;
  box-sizing: border-box;
  min-width: 150px;
  min-height: 180px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5);
  z-index: 1;
  background-color: #f2f2f2;
  padding: 0;
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
div[data-tippy-root] {
  display: none;
}
</style>
<style lang="scss">
.tippy-box[data-theme~='tomato'] {
  background-color: transparent;
  color: inherit;
}
</style>
