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
            :data="treeData"
            :props="defaultProps"
            style="user-select: none"
            @node-click="nodeClick"
          >
            <template #default="{ data, node }">
              <div v-if="!statLabel(data)">
                <i
                  v-if="!node.expanded"
                  class="el-icon-folder"
                  style="margin-right: 4px"
                ></i>
                <i
                  v-if="node.expanded"
                  class="el-icon-folder-opened"
                  style="margin-right: 4px"
                ></i>
                <span>{{ node.label }}</span>
              </div>
              <div v-else>
                <i class="el-icon-document" style="margin-right: 4px"></i>

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
import { getTreeData, readFileText, writeFileText } from '@/utils';
import { TreeData, TreeNode } from 'element-ui/types/tree';
import { Component, Vue } from 'vue-property-decorator';
import { resolve } from 'path';
import { configDir, dirConfigPath, workDir } from '@/asserts/dir-config';
import { ActiveFileModule } from '@/store/modules/active-file';

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

  mounted(): void {
    setTimeout(this.refresh, 500);
  }

  refresh(): void {
    console.log('refresh');

    // 从配置文件读取过滤的文件树数据
    const fileManageJson: Record<string, string>[] = readFileText(
      resolve(configDir, 'app_config', 'file-manage.json')
    );
    const fileList = fileManageJson.map((item) => item.file);
    this.treeData = getTreeData(workDir, fileList);
  }

  setLastOpenFilePath(path: string): void {
    const object = getUserconfig();
    object.lastOpenFile = path;
    writeFileText(dirConfigPath, object);
  }

  nodeClick(data: TreeMeta, node: TreeNode<PropertyKey, TreeMeta>): void {
    console.log(node);

    const path = data.path;
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return;
    }

    ActiveFileModule.SetPath(path);
    this.$emit('update:table');

    this.setLastOpenFilePath(path);
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
