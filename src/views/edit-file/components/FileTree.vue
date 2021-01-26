<template>
  <div
    class="tree"
    @mouseenter="dirButtons = true"
    @mouseleave="dirButtons = false"
  >
    <div class="activing">
      <span class="work-dir" :title="workDir">{{ workDir }}</span>
      <div v-show="dirButtons">
        <i
          class="el-icon-refresh refresh-tree"
          title="刷新目录"
          @click="refresh"
        ></i>
      </div>
    </div>
    <div class="tree-warp">
      <div class="scrollbar">
        <el-scrollbar style="height: 100%" wrapStyle="overflow-x: hidden;">
          <el-tree
            ref="tree"
            :data="treeData"
            :props="defaultProps"
            :highlight-current="true"
            :default-expanded-keys="defaultExpandedKeys"
            :auto-expand-parent="false"
            :current-node-key="currentNodeKey"
            style="user-select: none"
            node-key="path"
            @node-click="nodeClick"
            @node-expand="nodeExpand"
            @node-collapse="nodeCollapse"
          >
            <template #default="{ data, node }">
              <div v-if="!statLabel(data)">
                <i
                  v-if="!node.expanded"
                  class="iconfont icon-folder"
                  style="margin-right: 4px; color: #ffc800"
                ></i>
                <i
                  v-if="node.expanded"
                  class="iconfont icon-049-folder-open"
                  style="margin-right: 4px; color: #ffc800"
                ></i>
                <span>{{ node.label }}</span>
              </div>
              <div v-else>
                <i
                  class="iconfont icon-Microsoft-Excel"
                  style="margin-right: 4px; color: #008000"
                ></i>
                <span :title="titlePath(data)">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { statSync } from 'fs';
import { getUserconfig } from '@/asserts/userconfig';
import { getTreeDataDefault, writeFileText } from '@/utils';
import { TreeData } from 'element-ui/types/tree';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { dirConfigPath, workDir } from '@/asserts/dir-config';
import { ActiveFileModule } from '@/store/modules/active-file';
import { FileTreeModule } from '@/store/modules/file-tree';
import { Tree } from 'element-ui';
import { cloneDeep } from 'lodash';

interface TreeMeta extends TreeData {
  path: string;
}

@Component
export default class FileTree extends Vue {
  treeData: TreeMeta[] = [];
  /** 标题和子级使用的字段名 */
  defaultProps = {
    children: 'children',
    label: 'label',
    path: 'path',
  };
  workDir = workDir;
  dirButtons = false;
  defaultExpandedKeys = cloneDeep(FileTreeModule.expandedKeys);
  currentNodeKey = ActiveFileModule.path;

  mounted(): void {
    this.refresh();
  }

  async refresh(): Promise<void> {
    this.treeData = getTreeDataDefault();
    await this.$nextTick();
    (this.$refs.tree as Tree).setCurrentKey(ActiveFileModule.path);
  }

  setLastOpenFilePath(path: string): void {
    const object = getUserconfig();
    object.lastOpenFile = path;
    writeFileText(dirConfigPath, object);
  }

  nodeClick(data: TreeMeta): void {
    const path = data.path;
    const stat = statSync(path);

    if (stat.isDirectory()) {
      this.$nextTick(() => {
        (this.$refs.tree as Tree).setCurrentKey(ActiveFileModule.path);
      });
      return;
    }

    ActiveFileModule.SetPath(path);
    this.$emit('update:table');

    this.setLastOpenFilePath(path);
  }

  nodeExpand(data: TreeMeta): void {
    FileTreeModule.appendKey(data.path);
  }

  nodeCollapse(data: TreeMeta): void {
    FileTreeModule.removeKey(data.path);
  }

  statLabel(data: TreeMeta): boolean {
    if (!data.label) throw new Error('节点必须有label属性');

    return data.label?.endsWith('.xlsx');
  }

  titlePath(data: TreeMeta): string {
    return data.path;
  }
}
</script>
<style lang="scss" scoped>
div.tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  div.tree-warp {
    flex-grow: 1;
    position: relative;
    div.scrollbar {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
  }
}
div.activing {
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 8px;
  background-color: #ececec;
  justify-content: space-between;
  & > span.work-dir {
    display: inline-block;
    width: 60%;
    cursor: default;
    user-select: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  i.refresh-tree,
  i.el-icon-folder-remove,
  i.el-icon-folder-add {
    cursor: pointer;
  }
}
</style>
