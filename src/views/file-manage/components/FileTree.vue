<template>
  <div>
    <OpenFolder @refresh="setTreeFromStorage" />
    <div style="display: flex">
      <el-scrollbar
        style="height: 40vh"
        wrapStyle="overflow-x: hidden;"
        v-loading="treeLoading"
      >
        <el-tree
          :default-expand-all="true"
          :data="treeData"
          :props="defaultProps"
          @node-click="handleNodeClick"
          style="width: 400px"
        ></el-tree>
      </el-scrollbar>

      <el-table
        :data="tableData"
        v-loading="loading"
        style="flex: 1"
        height="40vh"
      >
        <el-table-column type="index"></el-table-column>
        <el-table-column label="ID" prop="id" width="100"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="描述" prop="desc"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { readFileSync, statSync } from 'fs';
import { TreeData } from 'element-ui/types/tree';
import { Workbook } from 'exceljs';
import { Notification } from 'element-ui';

import { readFile } from '@/utils/fileStream';
import { getUserconfig } from '@/asserts/userconfig';
import { getTreeData } from '@/utils/filtFileTree';
import { getSheet } from '@/utils/likeSheet';

import OpenFolder from './OpenFolder.vue';

interface TreeMeta extends TreeData {
  path: string;
}

@Component({
  components: {
    OpenFolder,
  },
})
export default class FileTree extends Vue {
  @Prop({ type: String, required: true }) configPath!: string;

  getTreeData = getTreeData;
  treeLoading = false;
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
    this.setTreeFromStorage();
  }

  async setTreeFromStorage(): Promise<void> {
    this.treeLoading = true;
    await this.$nextTick();
    const config = getUserconfig();
    if (config.workDir) {
      const fileList = this.getFileList();
      const data = getTreeData(config.workDir, fileList);
      this.treeData = data;
    }
    await this.$nextTick();
    this.treeLoading = false;
  }

  getFileList(): string[] {
    const array: Record<string, string>[] = readFile(this.configPath);
    return array.map((item) => item.file);
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
    const worksheet = getSheet(workbook, 'task');

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

    const idList: string[] = [];
    worksheet
      .getColumn(fieldIndex.id)
      .eachCell((cell) => idList.push(cell.text));
    const nameList: string[] = [];
    worksheet
      .getColumn(fieldIndex.name)
      .eachCell((cell) => nameList.push(cell.text));
    const descList: string[] = [];
    worksheet
      .getColumn(fieldIndex.desc)
      .eachCell((cell) => descList.push(cell.text));

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
          id: idList[index],
          name: nameList[index],
          desc: descList[index],
        };

        array.push(o);
        index++;
      }
      this.tableData = array;
    }

    this.loading = false;
  }
}
</script>
