<template>
  <div>
    <el-button @click="visible = true" style="margin-right: 10px"
      >打开文件</el-button
    >
    <span>{{ filePath }}</span>
    <el-dialog :visible.sync="visible" :close-on-click-modal="false">
      <el-tree
        :default-expand-all="true"
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
import { Notification } from 'element-ui';
import { TreeData } from 'element-ui/types/tree';
import { Workbook } from 'exceljs';

import store from '@/store';
import { readFile, writeFile } from '@/utils/fileStream';
import { getTreeData } from '@/utils/filtFileTree';
import { getUserconfig } from '@/asserts/userconfig';
import { userdir } from '@/asserts/userdir';
import { getSheet } from '@/utils/likeSheet';

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

    // 从配置文件读取最后一次打开的文件
    this.$emit('show-loading');
    await this.$nextTick();
    const object: Record<string, string> = readFile(userdir);
    const { lastOpenFile } = object;
    this.filePath = lastOpenFile;

    const wb = new Workbook();
    const buffer = readFileSync(lastOpenFile);
    const workbook = await wb.xlsx.load(buffer);

    this.setColumnKey(workbook);

    store.commit('workbook', workbook);

    this.$emit('task-worksheet', getSheet(workbook, 'task'), lastOpenFile);
  }

  async submit(): Promise<void> {
    console.time('submit');
    const path = this.nodePath;
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return;
    }

    this.visible = false;
    this.$emit('show-loading');
    await this.$nextTick();
    this.filePath = this.nodePath;

    console.time('unit');
    const wb = new Workbook();
    const buffer = readFileSync(path);
    const workbook = await wb.xlsx.load(buffer);
    console.timeEnd('unit');
    this.setColumnKey(workbook);

    store.commit('workbook', workbook);

    const worksheet = getSheet(workbook, 'task');

    if (typeof worksheet === 'undefined') {
      Notification({
        title: '读取文件错误',
        message: '未获取到工作表【task】',
        type: 'error',
        duration: 0,
        position: 'bottom-right',
      });
      return;
    }

    this.$emit('task-worksheet', worksheet, this.filePath);
    console.timeEnd('submit');
  }

  setColumnKey(wb: Workbook): void {
    wb.eachSheet((ws) => {
      ws.getRow(1).eachCell((cell, index) => {
        const head = cell.toString();
        const key = head.split('|')[0];
        const name = head.split('|')[1];
        if (key || name) {
          const column = ws.getColumn(index);
          column.key = key || name;
        }
      });
    });
  }

  nodeClick(d: TreeMeta): void {
    console.time('nodeClick');
    this.nodePath = d.path;
    this.setLastOpenFilePath(d.path);
    console.timeEnd('nodeClick');
    this.submit();
  }

  setLastOpenFilePath(path: string): void {
    const object: Record<string, any> = readFile(userdir);
    object['lastOpenFile'] = path;
    writeFile(userdir, object);
  }
}
</script>
