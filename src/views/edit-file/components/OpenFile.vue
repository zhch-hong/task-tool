<template>
  <div>
    <el-button @click="visible = true">打开文件</el-button>
    <span>{{ filePath }}</span>
    <el-dialog :visible.sync="visible" :close-on-click-modal="false">
      <el-tree
        :default-expand-all="true"
        :data="treeData"
        :props="defaultProps"
        @node-click="(d) => (nodePath = d.path)"
        style="width: 400px"
      ></el-tree>
      <template #footer
        ><DialogFooter @resolve="submit" @reject="visible = false"
      /></template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { readFileSync, statSync } from 'fs';
import { Notification } from 'element-ui';
import { TreeData } from 'element-ui/types/tree';
import { Workbook } from 'exceljs';

import DialogFooter from '@/components/DialogFooter.vue';
import store from '@/store';

interface TreeMeta extends TreeData {
  path: string;
}

const treeDataStr = localStorage.getItem('filtedFileTree');
const treeData = JSON.parse(treeDataStr || '[]');

@Component({
  components: {
    DialogFooter,
  },
})
export default class OpenFile extends Vue {
  visible = false;
  nodePath = '';
  filePath = '';
  treeData = treeData;
  /** 标题和子级使用的字段名 */
  defaultProps = {
    children: 'children',
    label: 'label',
    path: 'path',
  };

  async submit(): Promise<void> {
    const path = this.nodePath;
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return;
    }

    this.filePath = this.nodePath;

    const wb = new Workbook();
    const buffer = readFileSync(path);
    const workbook = await wb.xlsx.load(buffer);

    this.setColumnKey(workbook);

    store.commit('workbook', workbook);

    const worksheet = workbook.getWorksheet('task');

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
    this.visible = false;
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
}
</script>
