<template>
  <div>
    <OpenFolder @filder-path="filderPath" @refresh="refresh" />
    <div style="display: flex">
      <el-tree
        :default-expand-all="true"
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick"
        style="width: 400px"
      ></el-tree>

      <el-table :data="tableData" v-loading="loading" style="flex: 1">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="ID" prop="id" width="100"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="描述" prop="desc"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { readdirSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { TreeData } from 'element-ui/types/tree';
import { Workbook } from 'exceljs';
import { Notification } from 'element-ui';

import { readFile } from '@/utils/fileStream';

import OpenFolder from './OpenFolder.vue';

interface TreeMeta extends TreeData {
  path: string;
}

const configPath = 'D:\\JyQipai_doc\\app_config\\file-manage.json';

@Component({
  components: {
    OpenFolder,
  },
})
export default class FileTree extends Vue {
  /** 文件夹路径 */
  folderPath = '';
  /** 标题和子级使用的字段名 */
  defaultProps = {
    children: 'children',
    label: 'label',
    path: 'path',
  };
  loading = false;
  treeData: TreeMeta[] = [];
  tableData: Record<string, any>[] = [];

  created(): void {
    this.refresh();
  }

  getFileList(): string[] {
    const array: Record<string, string>[] = readFile(configPath);
    return array.map((item) => item.file);
  }

  filderPath(path: string): void {
    this.folderPath = path;
    this.refresh();
  }

  refresh(): void {
    if (!this.folderPath) return;
    const fileList = this.getFileList();
    const data = this.getTreeData(this.folderPath, fileList);
    this.treeData = data;
  }

  getTreeData(path: string, fileList: string[]): TreeMeta[] {
    const array: TreeMeta[] = [];
    const dirs = readdirSync(path);
    dirs.forEach((dir) => {
      const _path = resolve(path, dir);
      const stats = statSync(_path);
      if (stats.isFile()) {
        if (fileList.includes(dir)) {
          array.push({ label: dir, path: _path });
        }
      } else if (stats.isDirectory()) {
        const list = this.getTreeData(_path, fileList);
        if (list.length !== 0) {
          array.push({
            label: dir,
            path: _path,
            children: list,
          });
        }
      }
    });
    return array;
  }

  async handleNodeClick(data: TreeMeta): Promise<void> {
    const path = data.path;
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return;
    }

    this.tableData = [];
    await this.$nextTick();
    this.loading = true;

    const wb = new Workbook();
    const buffer = readFileSync(path);
    const workbook = await wb.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet('task');

    if (typeof worksheet === 'undefined') {
      Notification({
        title: '读取文件错误',
        message: '未获取到工作表【task】',
        type: 'error',
        duration: 0,
        position: 'bottom-right',
      });
      this.loading = false;
      return;
    }

    const rowValues = worksheet.getRow(1).values;

    const fieldIndex: Record<string, number> = {};
    if (Array.isArray(rowValues)) {
      rowValues.filter((item, index) => {
        if (item) {
          const str = item.toString();
          if (str.split('|')[0] === 'id') fieldIndex['id'] = index;
          if (str.split('|')[0] === 'name') fieldIndex['name'] = index;
          if (str.split('|')[0] === '' && str.split('|')[1] === '任务内容说明')
            fieldIndex['desc'] = index;
        }
      });
    }

    const idList = worksheet.getColumn(fieldIndex.id).values;
    const nameList = worksheet.getColumn(fieldIndex.name).values;
    const descList = worksheet.getColumn(fieldIndex.desc).values;

    if (
      Array.isArray(idList) &&
      Array.isArray(nameList) &&
      Array.isArray(descList)
    ) {
      const array: Record<string, any>[] = [];
      const max = Math.max(idList.length, nameList.length, descList.length);

      let index = 2;
      while (index < max) {
        const o = {
          id: idList[index]?.toString(),
          name: nameList[index]?.toString(),
          desc: descList[index]?.toString(),
        };
        debugger;
        array.push(o);
        index++;
      }
      this.tableData = array;
    }

    this.loading = false;
  }
}
</script>
