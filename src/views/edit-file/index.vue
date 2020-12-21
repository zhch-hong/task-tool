<template>
  <div class="edit-file">
    <div>
      <OpenFile />
      <el-button @click="refreshTable">刷新</el-button>
      <el-button @click="createTask">添加任务</el-button>
      <el-button @click="copySelection">拷贝</el-button>
      <el-button @click="pasteTask">粘贴</el-button>
      <el-button @click="doubleTask">复制</el-button>
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
      <el-table-column
        label="任务内容说明"
        prop="任务内容说明"
      ></el-table-column>
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

import store from '@/store';
import { SheetName, WorkbookMap } from '@/shims-cust';

import OpenFile from './components/OpenFile.vue';
import { cloneDeep } from 'lodash';
import { stringify } from '@/utils';
import { writeMapToExcel } from '@/utils/xlsxIO';

@Component({
  components: {
    OpenFile,
  },
})
export default class EditFile extends Vue {
  tableData: Record<string, string>[] = [];
  loading = false;

  tableSelection: Record<string, string>[] = [];

  created(): void {
    store.commit('observable', {
      property: 'workbookMap',
      componentName: this.$options.name,
      method: this.refreshTable,
    });
    this.refreshTable();
  }

  createTask(): void {
    this.$router.push('/edit-task');
  }

  refreshTable(): void {
    const workbookMap: WorkbookMap = store.getters.workbookMap();
    const taskList = workbookMap.get('task');
    if (taskList) {
      this.tableData = cloneDeep(taskList);
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

  doubleTask(): void {
    this.copySelection();
    this.pasteTask();
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

    store.commit('copyTaskList', stringify(copyList));

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

    const workbookMap: WorkbookMap = store.getters.workbookMap();

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

        const taskList = workbookMap.get('task');
        if (taskList) taskList.push(taskjson);
        const processList = workbookMap.get('process_data');
        if (processList) processList.push(processjson);
        const sourceList = workbookMap.get('source');
        if (sourceList) sourceList.push(...sourcejson);
        const conditionList = workbookMap.get('condition');
        if (conditionList) conditionList.push(...conditionjson);
        const awardList = workbookMap.get('award_data');
        if (awardList) awardList.push(...awardjson);
      }
    });
    store.commit('workbookMap', workbookMap);
    writeMapToExcel(workbookMap);
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
