<template>
  <div ref="WorkspaceExcel" class="workspace-excel">
    <div ref="Resize" class="resize" @mousedown.prevent.stop="resizeMousedown($event)"></div>
    <el-input v-model="searchKey" clearable placeholder="输入文件名搜索" prefix-icon="el-icon-search"></el-input>
    <div ref="ScrollBar" class="scrollbar">
      <el-tree
        ref="tree"
        :data="treeData"
        :highlight-current="true"
        :filter-node-method="filterNode"
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
    </div>
  </div>
</template>
<script lang="ts">
import fs from 'fs';
import path from 'path';
import Vue from 'vue';
import { workspanceExcel } from '@/utils';

export default Vue.extend({
  name: 'WorkspaceExcel',

  data() {
    return {
      searchKey: '',
      excelPath: '',
      treeData: [] as Array<Record<string, any>>,
      searchTimer: null as number | null,
    };
  },

  watch: {
    searchKey(value: string): void {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = window.setTimeout(this.$refs.tree.filter, 500, value);
    },
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
      // this.$emit('open-excel', path);
    },

    filterNode(value: string, data: Record<string, any>): boolean {
      if (!value) return true;

      const _path = data.path;

      if (typeof path === 'undefined' || _path === '') return true;

      return data.label.includes(value) && (path.extname(_path) === '.xls' || path.extname(_path) === '.xlsx');
    },

    statLabel(data: Record<string, any>): boolean {
      if (!data.label) throw new Error('节点必须有label属性');

      return data.label?.endsWith('.xlsx');
    },

    titlePath(data: Record<string, any>): string {
      return data.path;
    },

    resizeMousedown(event: MouseEvent): void {
      const LW = (this.$refs.WorkspaceExcel as HTMLDivElement).clientWidth;
      document.onmousemove = (mEvent: MouseEvent) => {
        if (mEvent.pageX > event.pageX) {
          const diff = mEvent.pageX - event.pageX;
          (this.$refs.WorkspaceExcel as HTMLDivElement).style.width = LW + diff + 'px';
        }
        if (mEvent.pageX < event.pageX) {
          const diff = event.pageX - mEvent.pageX;
          (this.$refs.WorkspaceExcel as HTMLDivElement).style.width = LW - diff + 'px';
        }
      };

      document.addEventListener(
        'mouseup',
        () => {
          document.onmousemove = null;
          this.$emit('render-table');
          const ScrollBar = this.$refs.ScrollBar as HTMLDivElement;
          if (ScrollBar.clientWidth >= ScrollBar.scrollWidth) {
            (this.$refs.tree as any).$el.style.position = 'relative';
          } else {
            (this.$refs.tree as any).$el.style.position = 'absolute';
          }
        },
        { once: true }
      );
    },
  },
});
</script>
<style lang="scss" scoped>
div.workspace-excel {
  position: relative;
  min-width: 200px;
  max-width: 500px;
  div.resize {
    position: absolute;
    height: 100%;
    width: 5px;
    top: 0;
    right: 0;
    background-color: transparent;
    cursor: ew-resize;
    z-index: 10;
  }
  div.scrollbar {
    position: absolute;
    top: 35px;
    bottom: 0;
    width: 100%;
    overflow: auto;
  }
}
</style>
