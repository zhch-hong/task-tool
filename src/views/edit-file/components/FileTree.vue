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
import { readFileSync, statSync } from 'fs';
import { userConfig } from '@/asserts/userconfig';
import {
  getTreeData,
  readFileText,
  setColumnKey,
  workbook2map,
  writeFileText,
} from '@/utils';
import { TreeData } from 'element-ui/types/tree';
import { Component, PropSync, Vue } from 'vue-property-decorator';
import { resolve } from 'path';
import { userdir } from '@/asserts/userdir';
import { Workbook } from 'exceljs';
import store from '@/store';

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
    this.refresh();
  }

  refresh(): void {
    // 从配置文件读取过滤的文件树数据
    const workDir = userConfig.workDir;
    const fileManageJson: Record<string, string>[] = readFileText(
      resolve(workDir, 'app_config', 'file-manage.json')
    );
    const fileList = fileManageJson.map((item) => item.file);
    this.treeData = getTreeData(workDir, fileList);
  }

  setLastOpenFilePath(path: string): void {
    userConfig.lastOpenFile = path;
    writeFileText(userdir, userConfig);
  }

  nodeClick(data: TreeMeta): void {
    const path = data.path;

    this.setLastOpenFilePath(path);

    const stat = statSync(path);

    if (stat.isDirectory()) {
      return;
    }

    const wb = new Workbook();
    const buffer = readFileSync(path);
    wb.xlsx.load(buffer).then((workbook) => {
      setColumnKey(workbook);

      const map = workbook2map(workbook);

      store.commit('taskFilePath', path);
      store.commit('workbookMap', map);

      this.$emit('update:table');
    });

    this.visiblesync = false;
  }
}
</script>
