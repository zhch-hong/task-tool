<template>
  <div>
    <OpenFile @task-worksheet="taskWorksheet" @show-loading="loading = true" />
    <el-button @click="onclickRefresh">刷新</el-button>
    <el-button @click="createTask">添加任务</el-button>
    <el-table v-loading.fullscreen="loading" :data="tableData">
      <el-table-column type="selection" width="60"></el-table-column>
      <el-table-column type="index" width="60"></el-table-column>
      <el-table-column label="任务ID" prop="id" width="60"></el-table-column>
      <el-table-column label="名称" prop="name"></el-table-column>
      <el-table-column label="启用" prop="enable" width="60"></el-table-column>
      <el-table-column
        label="重置"
        prop="is_reset"
        width="60"
      ></el-table-column>
      <el-table-column label="获得类型" prop="own_type"></el-table-column>
      <el-table-column label="任务枚举" prop="task_enum"></el-table-column>
      <el-table-column label="任务内容说明" prop="desc"></el-table-column>
      <el-table-column width="80">
        <template #default="{ $index }">
          <el-button size="mini" @click="updateRow($index)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { CellValue, Worksheet } from 'exceljs';
import { Notification } from 'element-ui';

import store from '@/store';

import OpenFile from './components/OpenFile.vue';

@Component({
  components: {
    OpenFile,
  },
})
export default class EditFile extends Vue {
  tableData: Record<string, string>[] = [];
  loading = false;

  createTask(): void {
    this.$router.push('/edit-task');
  }

  onclickRefresh(): void {
    const workbook = store.state.workbook;
    if (workbook) {
      this.loading = true;
      this.taskWorksheet(
        workbook.getWorksheet('task'),
        store.state.taskFilePath
      );
    }
  }

  async taskWorksheet(worksheet: Worksheet, filePath: string): Promise<void> {
    store.commit('editFilePath', filePath);

    const rowValues = worksheet.getRow(1).values;
    const fieldIndex: Record<string, number> = {};
    if (Array.isArray(rowValues)) {
      rowValues.map((item, index) => {
        if (item) {
          const str = item.toString();
          const k = str.split('|')[0];
          if (k === 'id') {
            fieldIndex['id'] = index;
          } else if (k === 'name') {
            fieldIndex['name'] = index;
          } else if (k === 'enable') {
            fieldIndex['enable'] = index;
          } else if (k === 'is_reset') {
            fieldIndex['is_reset'] = index;
          } else if (k === 'own_type') {
            fieldIndex['own_type'] = index;
          } else if (k === 'task_enum') {
            fieldIndex['task_enum'] = index;
          }
          if (str.split('|')[1] === '任务内容说明') {
            fieldIndex['desc'] = index;
          }
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

    const enableList: string[] = [];
    worksheet
      .getColumn(fieldIndex.enable)
      .eachCell((cell) => enableList.push(cell.text));

    const is_resetList: string[] = [];
    worksheet
      .getColumn(fieldIndex.is_reset)
      .eachCell((cell) => is_resetList.push(cell.text));

    const own_typeList: string[] = [];
    worksheet
      .getColumn(fieldIndex.own_type)
      .eachCell((cell) => own_typeList.push(cell.text));

    const task_enumList: string[] = [];
    worksheet
      .getColumn(fieldIndex.task_enum)
      .eachCell((cell) => task_enumList.push(cell.text));

    const descList: string[] = [];
    worksheet
      .getColumn(fieldIndex.desc)
      .eachCell((cell) => descList.push(cell.text));

    if (
      Array.isArray(idList) &&
      Array.isArray(nameList) &&
      Array.isArray(enableList) &&
      Array.isArray(is_resetList) &&
      Array.isArray(own_typeList) &&
      Array.isArray(task_enumList) &&
      Array.isArray(descList)
    ) {
      const array: Record<string, any>[] = [];
      const max = idList.length;
      let index = 1;
      while (index < max) {
        const o = {
          id: idList[index],
          name: nameList[index],
          enable: enableList[index],
          is_reset: is_resetList[index],
          own_type: own_typeList[index],
          task_enum: task_enumList[index],
          desc: descList[index],
        };
        array.push(o);
        index++;
      }

      this.tableData = array;

      await this.$nextTick();
      this.loading = false;
    }
  }

  updateRow(index: number): void {
    const row = this.tableData[index];
    store.commit('updateTaskId', row.id);
    this.$router.push('/edit-task');
  }
}
</script>
