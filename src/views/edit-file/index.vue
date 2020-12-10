<template>
  <div class="edit-file">
    <div>
      <OpenFile
        @task-worksheet="taskWorksheet"
        @show-loading="loading = true"
      />

      <el-button @click="onclickRefresh">刷新</el-button>
      <el-button @click="createTask">添加任务</el-button>
      <el-button @click="copySelection">拷贝</el-button>
      <el-button @click="pasteTask">粘贴</el-button>
      <el-button>复制</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="tableData"
      height="auto"
      @selection-change="selectionChange"
    >
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

import store from '@/store';
import { getSheet } from '@/utils';
import { SheetName } from '@/shims-vue';

import OpenFile from './components/OpenFile.vue';
import { cloneDeep } from 'lodash';

@Component({
  components: {
    OpenFile,
  },
})
export default class EditFile extends Vue {
  tableData: Record<string, string>[] = [];
  loading = false;

  tableSelection: Record<string, string>[] = [];

  createTask(): void {
    this.$router.push('/edit-task');
  }

  async onclickRefresh(): Promise<void> {
    const workbook = store.state.workbook;
    if (workbook) {
      const worksheet = getSheet(workbook, 'task');
      if (worksheet) {
        this.loading = true;
        await this.$nextTick();
        this.taskWorksheet(worksheet, store.state.taskFilePath);
      }
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
      ?.eachCell((cell) => descList.push(cell.text));

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

      this.tableData = array.splice(0, 20);

      await this.$nextTick();
      this.loading = false;
    }
  }

  updateRow(index: number): void {
    const row = this.tableData[index];
    store.commit('updateTaskId', row.id);
    this.$router.push('/edit-task');
  }

  selectionChange(selection: Record<string, string>[]): void {
    this.tableSelection = selection;
  }

  copySelection(): void {
    const idList = this.tableSelection.map((task) => task.id);
    if (idList.length === 0) {
      this.$message.info('请勾选需要拷贝的任务');
      return;
    }

    const workbookMap: Map<SheetName, Record<string, string>[]> =
      store.state.workbookMap;
    const taskjson = workbookMap.get('task');
    const processjson = workbookMap.get('process_data');
    const sourcejson = workbookMap.get('source');
    const conditionjson = workbookMap.get('condition');
    const awardjson = workbookMap.get('award_data');

    const copyList: Record<
      string,
      Record<string, string> | Record<string, string>[]
    >[] = [];
    if (taskjson && processjson && sourcejson && conditionjson && awardjson) {
      idList.forEach((id) => {
        const object: Record<
          string,
          Record<string, string> | Record<string, string>[]
        > = {};
        const task = taskjson.find((item) => item.id === id);
        if (task) {
          object['task'] = task;

          const { process_id } = task;
          const process = processjson.find(
            (item) => item.process_id === process_id
          );

          if (process) {
            object['process'] = process;

            const { awards, source_id } = process;
            const awardList = this.getAwardList(awards);
            if (awardList) object['awards'] = awardList;

            object['source'] = sourcejson.filter(
              (item) => item.source_id === source_id
            );
            const conditionidList = object.source.map(
              (item) => item.condition_id
            );

            object['condition'] = conditionjson.filter((item) =>
              conditionidList.includes(item.condition_id)
            );
          }
        }

        copyList.push(object);
      });
    }

    store.commit('copyTaskList', JSON.parse(JSON.stringify(copyList)));

    this.$message.success('拷贝成功');
  }

  getAwardList(award: string): Record<string, string>[] | undefined {
    const idList = award.split(',');
    const workbookMap: Map<SheetName, Record<string, string>[]> =
      store.state.workbookMap;
    const awardjson = workbookMap.get('award_data');
    if (awardjson) {
      return awardjson.filter((item) => idList.includes(item.award_id));
    }
  }

  pasteTask(): void {
    let copyTaskList = store.state.copyTaskList;
    copyTaskList = cloneDeep(copyTaskList);
    if (!copyTaskList) {
      this.$message.info('尚未拷贝任务');
      return;
    }

    const taskid = store.getters.taskid;
    const processid = store.getters.processid;
    const sourceid = store.getters.sourceid;
    const conditionid = store.getters.conditionid;
    const awardid = store.getters.awardid;
    copyTaskList.forEach((copyTask) => {
      const taskjson = copyTask.task as Record<string, string>;
      const processjson = copyTask.process as Record<string, string>;
      const sourcejson = copyTask.source as Record<string, string>[];
      const conditionjson = copyTask.condition as Record<string, string>[];
      const awardjson = copyTask.awards as Record<string, string>[];
      if (taskjson && processjson && sourcejson && conditionjson && awardjson) {
        taskjson.id = taskid();

        const newProcessid = processid();
        const newSourceid = sourceid();

        taskjson.process_id = newProcessid;
        processjson.process_id = newProcessid;
        processjson.source_id = newSourceid;

        const newAwardid: string[] = [];
        processjson.awards.split(',').forEach((award_id) => {
          const _award_id = awardid();
          newAwardid.push(_award_id);
          awardjson.forEach((award) => {
            if (award.award_id === award_id) award.award_id = _award_id;
          });
        });
        processjson.awards = newAwardid.join(',');

        sourcejson.forEach((source) => {
          const newConditionid = conditionid();
          source.source_id = newSourceid;
          source.condition_id = newConditionid;
          conditionjson.forEach((cond) => {
            if (cond.condition_id === source.condition_id)
              cond.condition_id = newConditionid;
          });
        });

        console.log(JSON.parse(JSON.stringify(taskjson)));
        console.log(JSON.parse(JSON.stringify(processjson)));
        console.log(JSON.parse(JSON.stringify(sourcejson)));
        console.log(JSON.parse(JSON.stringify(conditionjson)));
        console.log(JSON.parse(JSON.stringify(awardjson)));
      }
    });
  }
}
</script>
<style lang="scss" scoped>
.edit-file {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
