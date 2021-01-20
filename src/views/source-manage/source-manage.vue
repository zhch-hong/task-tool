<template>
  <div style="width: 500px; margin: 20px 0 0 20px">
    <el-tree
      ref="eltree"
      draggable
      node-key="uuid"
      :data="treeData"
      :highlight-current="false"
      :default-expand-all="false"
      @node-drop="nodeDrop"
    >
      <template #default="{ node, data }">
        <NodeItem
          :tree-node="node"
          :tree-data="data"
          @append="append(node, data)"
          @update="update(node, data)"
          @remove="remove(node, data)"
        >
          <span v-if="data.type === 'root'"
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
          >
        </NodeItem>
      </template>
    </el-tree>
    <!-- tippy.js自定义主题，在树节点会用到，因为是公用的，所以在这里（父级）定义，它的css也必须是全局的，不能scoped -->
    <div data-tippy-root>
      <div class="tippy-box" data-theme="tomato">
        <div class="tippy-content"></div>
      </div>
    </div>

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
import { Component, Vue } from 'vue-property-decorator';
import { TreeData, TreeNode } from 'element-ui/types/tree';
import { resolve } from 'path';
import { v4 as uuid } from 'uuid';

import { readFileText, writeFileText } from '@/utils/fileSystem';

import UpdateNode from './components/UpdateNode.vue';
import NodeItem from './components/NodeItem.vue';
import { workDir } from '@/asserts/dir-config';

interface TreeMeta extends TreeData {
  uuid?: string;
  type?: string;
}

const filePath = resolve(workDir, 'app_config', 'source-manage.json');

@Component({
  components: {
    UpdateNode,
    NodeItem,
  },
})
export default class SourceManage extends Vue {
  treeData: TreeMeta[] = [];
  model: 'append' | 'update' = 'append';
  updateNode = false;
  updateTreeNode: TreeNode<string, TreeMeta> | null = null;
  updateTreeData: TreeMeta | null = {};

  mounted(): void {
    this.loadTreeData();
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

  append(node: TreeNode<string, TreeMeta>, data: TreeMeta): void {
    this.model = 'append';
    this.updateTreeNode = node;
    this.updateTreeData = data;
    this.updateNode = true;
  }

  update(node: TreeNode<string, TreeMeta>, data: TreeMeta): void {
    if (data?.id === 'root') return;

    this.model = 'update';
    this.updateTreeNode = node;
    this.updateTreeData = data;
    this.updateNode = true;
  }

  remove(node: TreeNode<string, TreeMeta>, data: TreeMeta): void {
    if (data?.id === 'root') return;

    const parent = node?.parent;
    if (!parent) return;

    const children = parent.data.children || parent.data;
    if (!Array.isArray(children)) return;

    const index = children.findIndex((d) => d.id === data?.id);
    children.splice(index, 1);

    this.validateTree(this.treeData);

    writeFileText(filePath, this.treeData);
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
}
</script>

<style lang="scss">
.tippy-box[data-theme~='tomato'] {
  background-color: transparent;
  color: inherit;
  .tippy-content {
    padding: 0;
  }
}
</style>
