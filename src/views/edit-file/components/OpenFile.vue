<template>
  <div>
    <el-button @click="visible = true" style="margin-right: 10px"
      >打开文件</el-button
    >
    <span>{{ filePath }}</span>
    <el-dialog :visible.sync="visible" :close-on-click-modal="false">
      <el-tree
        :data="treeData"
        :props="defaultProps"
        @node-click="nodeClick"
        style="width: 400px"
      ></el-tree>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { resolve } from 'path';
import { Component, Vue } from 'vue-property-decorator';
import { readFileSync, statSync } from 'fs';
import { TreeData } from 'element-ui/types/tree';
import { Workbook } from 'exceljs';

import store from '@/store';
import { getUserconfig } from '@/asserts/userconfig';
import { userdir } from '@/asserts/userdir';
import { readLastFile } from '@/asserts/lastOpenFile';
import {
  readFile,
  writeFile,
  getTreeData,
  workbook2map,
  setColumnKey,
} from '@/utils';

import DialogFooter from '@/components/DialogFooter.vue';

interface TreeMeta extends TreeData {
  path: string;
}

@Component({
  components: {
    DialogFooter,
  },
})
export default class OpenFile extends Vue {
  visible = false;
  nodePath = '';
  filePath = '';
  treeData: TreeMeta[] = [];
  /** 标题和子级使用的字段名 */
  defaultProps = {
    children: 'children',
    label: 'label',
    path: 'path',
  };

  async created(): Promise<void> {
    // 从配置文件读取过滤的文件树数据
    const workDir = getUserconfig().workDir;

    const fileManageJson: Record<string, string>[] = readFile(
      resolve(workDir, 'app_config', 'file-manage.json')
    );
    const fileList = fileManageJson.map((item) => item.file);
    this.treeData = getTreeData(workDir, fileList);

    readLastFile().then((path) => {
      this.filePath = path || '';
    });
  }

  async submit(): Promise<void> {
    const path = this.nodePath;
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return;
    }

    this.visible = false;
    this.filePath = path;

    const wb = new Workbook();
    const buffer = readFileSync(path);
    const workbook = await wb.xlsx.load(buffer);
    setColumnKey(workbook);

    store.commit('taskFilePath', path);
    store.commit('workbookMap', workbook2map(workbook));
  }

  nodeClick(d: TreeMeta): void {
    this.nodePath = d.path;
    this.setLastOpenFilePath(d.path);
    this.submit();
  }

  setLastOpenFilePath(path: string): void {
    const object: Record<string, any> = readFile(userdir);
    object['lastOpenFile'] = path;
    writeFile(userdir, object);
  }
}
</script>
