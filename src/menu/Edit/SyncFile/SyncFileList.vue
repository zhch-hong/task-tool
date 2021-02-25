<template>
  <div class="sync">
    <el-tree
      ref="tree"
      :data="treeData"
      :props="defaultProps"
      :show-checkbox="true"
      style="user-select: none"
      node-key="path"
    >
      <template #default="{ data, node }">
        <div v-if="!statLabel(data)">
          <i v-if="!node.expanded" class="iconfont icon-folder" style="margin-right: 4px; color: #ffc800"></i>
          <i v-if="node.expanded" class="iconfont icon-049-folder-open" style="margin-right: 4px; color: #ffc800"></i>
          <span>{{ node.label }}</span>
        </div>
        <div v-else>
          <i class="iconfont icon-Microsoft-Excel" style="margin-right: 4px; color: #008000"></i>
          <span :title="titlePath(data)">{{ node.label }}</span>
        </div>
      </template>
    </el-tree>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import store from '@/electron-store';
import { getTreeData } from '@/utils';
import { TreeData } from 'element-ui/types/tree';
import { Tree } from 'element-ui';
import { SyncFileModule } from '@/store/modules/sync-file';

interface TreeMeta extends TreeData {
  path: string;
}

export default Vue.extend({
  name: 'SyncFileList',

  data() {
    return {
      treeData: [] as TreeMeta[],
      timer: null as number | null,
      defaultProps: {
        children: 'children',
        label: 'label',
        path: 'path',
      },
    };
  },

  computed: {
    fileName(): string | null {
      return SyncFileModule.fileName;
    },
  },

  watch: {
    fileName: {
      immediate: true,
      handler(value: string): void {
        if (!value) return;

        if (this.timer) {
          window.clearTimeout(this.timer);
        }

        this.timer = window.setTimeout(this.getTreeData, 0);
      },
    },
  },

  mounted() {
    this.getTreeData();
  },

  methods: {
    getTreeData() {
      if (!this.fileName) return;

      const workDir = store.get('workDir') as string;

      const data = [
        {
          label: workDir,
          path: workDir,
          children: getTreeData(workDir, [this.fileName]),
        },
      ];
      this.treeData = data;
    },

    statLabel(data: TreeMeta): boolean {
      if (!data.label) throw new Error('节点必须有label属性');

      return data.label?.endsWith('.xlsx');
    },

    titlePath(data: TreeMeta): string {
      return data.path;
    },

    submit(): string[] {
      const nodes: TreeMeta[] = (this.$refs.tree as Tree).getCheckedNodes(true) as TreeMeta[];
      const pathList = nodes.map((node) => node.path);
      return pathList;
    },
  },
});
</script>
<style lang="scss" scoped>
div.sync {
  height: 50vh;
  overflow: auto;
}
</style>
