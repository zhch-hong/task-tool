<template>
  <div>
    <OpenFile @task-worksheet="taskWorksheet" />
    <el-button @click="createTask">添加任务</el-button>
    <el-table :data="tableData">
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
import { Worksheet } from 'exceljs';
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

  createTask(): void {
    this.$router.push('/edit-task');
  }

  taskWorksheet(worksheet: Worksheet, filePath: string): void {
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

    const idList = worksheet.getColumn(fieldIndex.id).values;
    const nameList = worksheet.getColumn(fieldIndex.name).values;
    const enableList = worksheet.getColumn(fieldIndex.enable).values;
    const is_resetList = worksheet.getColumn(fieldIndex.is_reset).values;
    const own_typeList = worksheet.getColumn(fieldIndex.own_type).values;
    const task_enumList = worksheet.getColumn(fieldIndex.task_enum).values;
    const descList = worksheet.getColumn(fieldIndex.desc).values;

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
      let index = 2;
      while (index < max) {
        const o = {
          id: idList[index]?.toString(),
          name: nameList[index]?.toString(),
          enable: enableList[index]?.toString(),
          is_reset: is_resetList[index]?.toString(),
          own_type: own_typeList[index]?.toString(),
          task_enum: task_enumList[index]?.toString(),
          desc: descList[index]?.toString(),
        };
        array.push(o);
        index++;
      }

      this.tableData = array;
    }
  }

  updateRow(index: number): void {
    const row = this.tableData[index];
    store.commit('updateTaskId', row.id);
    this.$router.push('/edit-task');
  }
}
</script>
