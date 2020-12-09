<template>
  <div>
    <el-tree :data="treeData" node-key="id" draggable @node-drop="nodeDrop">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span style="margin-left: 20px">
          <el-button
            type="text"
            size="mini"
            @click.stop="() => appendChild(node, data)"
          >
            添加子级
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click.stop="() => remove(node, data)"
          >
            删除节点
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click.stop="() => update(node, data)"
          >
            编辑
          </el-button>
        </span>
      </span>
    </el-tree>
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

import { readFile, writeFile } from '@/utils/fileStream';
import { getUserconfig } from '@/asserts/userconfig';

import UpdateNode from './components/UpdateNode.vue';

const filePath = resolve(
  getUserconfig().workDir,
  'app_config',
  'source-manage.json'
);

@Component({
  components: {
    UpdateNode,
  },
})
export default class SourceManage extends Vue {
  treeData: TreeData[] = [
    {
      id: 'root',
      label: 'Root',
      children: [],
    },
  ];
  model: 'append' | 'update' = 'append';
  updateNode = false;
  updateTreeNode: TreeNode<string, TreeData> | null = null;
  updateTreeData: TreeData | null = {};

  created(): void {
    this.loadTreeData();
  }

  loadTreeData(): void {
    const array = readFile(filePath);
    if (array[0] && array[0].id === 'root') this.treeData = array;
    else this.treeData[0].children = array;
  }

  appendChild(node: TreeNode<string, TreeData>, data: TreeData): void {
    this.model = 'append';
    this.updateTreeNode = node;
    this.updateTreeData = data;
    this.updateNode = true;
  }

  update(node: TreeNode<string, TreeData>, data: TreeData): void {
    if (data.id === 'root') return;

    this.model = 'update';
    this.updateTreeNode = node;
    this.updateTreeData = data;
    this.updateNode = true;
  }

  remove(node: TreeNode<string, TreeData>, data: TreeData): void {
    if (data.id === 'root') return;

    const parent = node.parent;
    if (!parent) return;

    const children = parent.data.children || parent.data;
    if (!Array.isArray(children)) return;

    const index = children.findIndex((d) => d.id === data.id);
    children.splice(index, 1);

    writeFile(filePath, this.treeData);
  }

  submit(node: Record<string, string>): void {
    const { value, label } = node;
    if (this.model === 'append') {
      const node = {
        id: value,
        label: label,
        children: [],
      };
      this.updateTreeData?.children?.push(node);
    } else {
      const node: TreeData = {
        id: value,
        label: label,
        children: this.updateTreeData?.children,
      };
      if (this.updateTreeNode) {
        // this.updateTreeNode.data = node; // 这样写不会生效
        Object.assign(this.updateTreeNode.data, node);
      }
    }

    writeFile(filePath, this.treeData);
  }

  nodeDrop(
    before: TreeNode<string, TreeData>,
    after: TreeNode<string, TreeData>
  ): void {
    if (before.key === 'root' || after.key === 'root') {
      this.loadTreeData();
    }
  }
}
</script>
