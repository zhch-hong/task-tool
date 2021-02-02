<template>
  <div class="sync-file">
    <div class="content">
      <i class="el-icon-close close" @click="close"></i>
      <p class="title">选择需要同步的文件</p>
      <el-scrollbar style="height: 400px" wrapStyle="overflow-x: hidden;">
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
              <i
                v-if="node.expanded"
                class="iconfont icon-049-folder-open"
                style="margin-right: 4px; color: #ffc800"
              ></i>
              <span>{{ node.label }}</span>
            </div>
            <div v-else>
              <i class="iconfont icon-Microsoft-Excel" style="margin-right: 4px; color: #008000"></i>
              <span :title="titlePath(data)">{{ node.label }}</span>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
      <div style="text-align: right; margin-top: 10px">
        <el-button size="mini" type="primary" @click="submit">开始同步</el-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { getTreeDataDefault } from '@/utils';
import { TreeData } from 'element-ui/types/tree';
import { Tree } from 'element-ui';

interface TreeMeta extends TreeData {
  path: string;
}

export default Vue.extend({
  name: 'SyncFileList',

  data() {
    return {
      treeData: [] as TreeMeta[],
      defaultProps: {
        children: 'children',
        label: 'label',
        path: 'path',
      },
    };
  },

  created() {
    this.getTreeData();
  },

  methods: {
    getTreeData() {
      this.treeData = getTreeDataDefault();
    },

    statLabel(data: TreeMeta): boolean {
      if (!data.label) throw new Error('节点必须有label属性');

      return data.label?.endsWith('.xlsx');
    },

    titlePath(data: TreeMeta): string {
      return data.path;
    },

    close() {
      this.$emit('close');
    },

    submit(): void {
      const nodes: TreeMeta[] = (this.$refs.tree as Tree).getCheckedNodes(true) as TreeMeta[];
      const pathList = nodes.map((node) => node.path);
      this.$emit('path-list', pathList);
      this.close();
    },
  },
});
</script>
<style lang="scss" scoped>
div.sync-file {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background-color: rgba(0, 0, 0, 0.2);
  & > div.content {
    position: absolute;
    top: 20vh;
    left: 50%;
    width: 600px;
    transform: translateX(-50%);
    background-color: #fff;
    padding: 0 20px 20px;
    & > i.close {
      position: absolute;
      z-index: 1;
      top: 15px;
      right: 20px;
      font-size: 20px;
      &:active {
        background-color: #f2f2f2;
      }
    }
    & > p.title {
      font-size: 17px;
      font-weight: 600;
      margin: 1em 0;
    }
  }
}
</style>
