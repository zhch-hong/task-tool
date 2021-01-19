<template>
  <el-dialog :visible.sync="visiblesync" :close-on-click-modal="false">
    <el-button type="primary" size="mini" @click="refresh">刷新</el-button>
    <el-tree
      :data="treeData"
      :props="defaultProps"
      @node-click="nodeClick"
      style="width: 400px"
    ></el-tree>
  </el-dialog>
</template>
<script lang="ts">
import { statSync } from 'fs';
import { getUserconfig } from '@/asserts/userconfig';
import { getTreeData, readFileText, writeFileText } from '@/utils';
import { TreeData } from 'element-ui/types/tree';
import { Component, PropSync, Vue } from 'vue-property-decorator';
import { resolve } from 'path';
import { configDir, dirConfigPath, workDir } from '@/asserts/dir-config';
import { ActiveFileModule } from '@/store/modules/active-file';

interface TreeMeta extends TreeData {
  path: string;
}

@Component
export default class FileTree extends Vue {
  @PropSync('visible', { type: Boolean, required: true }) visiblesync!: boolean;

  treeData: TreeMeta[] = [];
  /** 标题和子级使用的字段名 */
  defaultProps = {
    children: 'children',
    label: 'label',
    path: 'path',
  };

  mounted(): void {
    setTimeout(this.refresh, 1000);
  }

  refresh(): void {
    // 从配置文件读取过滤的文件树数据
    const fileManageJson: Record<string, string>[] = readFileText(
      resolve(workDir, 'app_config', 'file-manage.json')
    );
    const fileList = fileManageJson.map((item) => item.file);
    this.treeData = getTreeData(workDir, fileList);
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
      return;
    }

    ActiveFileModule.SetPath(path);
    this.$emit('update:table');

    this.visiblesync = false;

    this.setLastOpenFilePath(path);
  }
}
</script>
