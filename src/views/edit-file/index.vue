<template>
  <div>
    <FileTree
      :visible="treeDialog"
      @update:visible="treeDialog = false"
      @refresh-table="refreshTable"
    />
    <div>
      <el-button @click="treeDialog = true">打开文件</el-button>
      <el-button @click="refreshTable">刷新</el-button>
      <el-button @click="createTask">添加任务</el-button>
      <el-button @click="copySelection">拷贝</el-button>
      <el-button @click="pasteTask">粘贴</el-button>
      <el-button @click="doubleTask">复制</el-button>
      <ExplorerPath />
    </div>
    <vxe-table
      ref="vxeTable"
      :data="tableData"
      :height="tableHeight"
      show-overflow="title"
      @checkbox-change="checkboxChange"
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column type="checkbox" width="60"></vxe-table-column>
      <vxe-table-column field="id" title="ID" width="100"></vxe-table-column>
      <vxe-table-column field="name" title="名称"></vxe-table-column>
      <vxe-table-column
        field="enable"
        title="启用"
        width="60"
      ></vxe-table-column>
      <vxe-table-column
        field="is_reset"
        title="重置"
        width="60"
      ></vxe-table-column>
      <vxe-table-column field="own_type" title="类型"></vxe-table-column>
      <vxe-table-column field="task_enum" title="枚举"></vxe-table-column>
      <vxe-table-column
        field="任务内容说明"
        title="任务内容说明"
      ></vxe-table-column>
      <vxe-table-column width="100">
        <template #default="{ rowIndex }">
          <el-button
            size="mini"
            icon="el-icon-edit"
            @click="updateRow(rowIndex)"
            >修改</el-button
          >
        </template>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>
<script lang="ts">
import { watch, FSWatcher } from 'fs';
import { Component, Vue, Watch } from 'vue-property-decorator';

import store from '@/store';
import { SheetName, WorkbookMap } from '@/shims-cust';

import { cloneDeep } from 'lodash';
import { stringify } from '@/utils';
import { writeMapToExcel } from '@/utils/xlsxIO';
import { readLastFile } from '@/asserts/lastOpenFile';
import { Table } from 'vxe-table';

import ExplorerPath from './components/ExplorerPath.vue';

@Component({
  components: {
    ExplorerPath,
    FileTree: () => import('./components/FileTree.vue'),
  },
})
export default class EditFile extends Vue {
  $refs!: {
    vxeTable: Table;
  };

  tableData: Record<string, string>[] = [];
  treeDialog = false;
  readLastFile = readLastFile;
  tableSelection: Record<string, string>[] = [];
  /** 监听文件改动后的setTimeout */
  watchFileTimer = -1;
  /** 文件监视器 */
  fileWatcher: FSWatcher | null = null;

  get taskFilePath(): string {
    return store.state.taskFilePath;
  }

  get tableHeight(): number {
    return this.$store.state.windowHeight - 32;
  }

  @Watch('taskFilePath', { immediate: true })
  pathWatch(path: string): void {
    // this.watchOpenedFile(path);
  }

  mounted(): void {
    this.readLastExcel();
  }

  readLastExcel(): void {
    readLastFile().then(() => {
      this.refreshTable();
    });
  }

  createTask(): void {
    this.$router.push('/edit-task');
  }

  refreshTable(): void {
    const workbookMap: WorkbookMap = store.getters.workbookMap();
    const taskList = workbookMap.get('task');
    if (taskList) {
      try {
        this.tableData = cloneDeep(taskList);
        this.$refs.vxeTable.updateData();
      } catch (error) {
        this.$notify.warning({
          title: '刷新数据失败',
          message: 'this.$refs.vxeTable is undefined',
          position: 'bottom-right',
        });
      }
    }
  }

  updateRow(index: number): void {
    const row = this.tableData[index];
    store.commit('updateTaskId', row.id);
    this.$router.push('/edit-task');
  }

  checkboxChange(data: Record<string, any>): void {
    const selection: Record<string, string>[] = data.records;
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

  watchOpenedFile(path: string): void {
    if (!path) return;

    if (this.fileWatcher) this.fileWatcher.close();

    this.fileWatcher = watch(path, () => {
      if (this.watchFileTimer !== -1) {
        clearTimeout(this.watchFileTimer);
      }
      this.watchFileTimer = window.setTimeout(() => {
        this.readLastExcel();
      }, 100);
    });
  }
}
</script>
