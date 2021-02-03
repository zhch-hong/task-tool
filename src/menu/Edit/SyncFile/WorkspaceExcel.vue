<template>
  <div class="scrollbar">
    <el-scrollbar style="height: 100%" wrapStyle="overflow-x: hidden;">
      <el-tree
        ref="tree"
        :data="treeData"
        :highlight-current="true"
        style="user-select: none"
        node-key="path"
        @node-click="nodeClick"
      >
        <template #default="{ data, node }">
          <div v-if="!statLabel(data)">
            <i v-if="!node.expanded" class="iconfont icon-folder" style="margin-right: 4px; color: #ffc800"></i>
            <i v-if="node.expanded" class="iconfont icon-049-folder-open" style="margin-right: 4px; color: #ffc800"></i>
            <span>{{ node.label }}</span>
          </div>
          <div v-else @dblclick.prevent.stop="nodeDblclick(data)">
            <i class="iconfont icon-Microsoft-Excel" style="margin-right: 4px; color: #008000"></i>
            <span :title="titlePath(data)">{{ node.label }}</span>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>
<script lang="ts">
import fs from 'fs';
import Vue from 'vue';
import { workspanceExcel } from '@/utils';

export default Vue.extend({
  name: 'WorkspaceExcel',

  data() {
    return {
      excelPath: '',
      treeData: [] as Array<Record<string, any>>,
    };
  },

  mounted() {
    this.loadTreeData();
  },

  methods: {
    loadTreeData(): void {
      this.treeData = workspanceExcel();
    },

    nodeClick(data: Record<string, any>): void {
      const path: string = data.path;
      const stat = fs.statSync(path);

      if (stat.isDirectory()) {
        return;
      }

      this.$emit('click-file', path);
    },

    nodeDblclick(data: Record<string, any>): void {
      const path: string = data.path;
      this.$emit('open-excel', path);
    },

    statLabel(data: Record<string, any>): boolean {
      if (!data.label) throw new Error('节点必须有label属性');

      return data.label?.endsWith('.xlsx');
    },

    titlePath(data: Record<string, any>): string {
      return data.path;
    },
  },
});
</script>
<style lang="scss" scoped>
div.scrollbar {
  height: 55vh;
}
</style>
