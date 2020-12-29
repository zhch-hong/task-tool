<template>
  <div>
    <div>
      <el-button @click="treeDialog = true" title="Ctrl+O">打开文件</el-button>
      <el-button @click="readLastExcel" title="F5">刷新</el-button>
      <el-button @click="createTask" title="Ctrl+N">添加任务</el-button>
      <el-button @click="copySelection" title="Ctrl+C">拷贝</el-button>
      <el-button @click="pasteTask" title="Ctrl+V">粘贴</el-button>
      <el-button @click="doubleTask" title="Ctrl+D">复制</el-button>
      <ExplorerPath />
    </div>
    <vxe-table
      :data="tableData"
      :height="tableHeight"
      :highlight-current-row="true"
      :row-key="true"
      :checkbox-config="{ range: true }"
      :keyboard-config="{
        isArrow: true,
        isChecked: false,
        isEnter: false,
        isTab: false,
      }"
      @checkbox-change="checkboxChange"
      @keydown="tableKeydown"
      row-id="uuid"
      show-overflow="title"
      ref="vxeTable"
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column
        type="checkbox"
        width="60"
        align="center"
      ></vxe-table-column>
      <vxe-table-column
        field="id"
        title="ID"
        width="100"
        align="center"
      ></vxe-table-column>
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

    <FileTree
      :visible="treeDialog"
      @update:visible="treeDialog = false"
      @update:table="refreshTable"
    />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { cloneDeep } from 'lodash';
import { InterceptorKeydownParams, RowInfo, Table } from 'vxe-table';
import { bind, unbind } from 'mousetrap';
import { v4 as uuid } from 'uuid';

import store from '@/store';
import { SheetName, WorkbookMap } from '@/shims-cust';
import { stringify } from '@/utils';
import { writeMapToExcel } from '@/utils/xlsxIO';
import { readLastFile } from '@/asserts/lastOpenFile';

import ExplorerPath from './components/ExplorerPath.vue';

export default Vue.extend({
  name: 'EditFile',
  components: {
    ExplorerPath,
    // eslint-disable-next-line vue/no-unused-components
    FileTree: () => import('./components/FileTree.vue'),
  },
  data() {
    return {
      tableData: [] as Record<string, string>[],
      treeDialog: false,
      readLastFile: readLastFile,
      tableSelection: [] as Record<string, string>[],
      /** 最后一次勾选的数据行，用于按住shift键连选时的开头位置 */
      lastChecked: null as Record<string, never> | null,
      /** 最后一次取消勾选的数据行，用于按住shift键连续取消时的开头位置 */
      lastUnChecked: null as Record<string, never> | null,
      /** 表格刷新数据后需要执行的函数 */
      afterRefreshTable: null as (() => Promise<void>) | null,
    };
  },

  computed: {
    taskFilePath(): string {
      return store.state.taskFilePath;
    },

    tableHeight(): number {
      return this.$store.state.windowHeight - 62;
    },
  },

  async mounted(): Promise<void> {
    this.afterRefreshTable = this.setTableScroll;
    // 这里加上$nextTick，不然路由跳转的等待时间会大大加长，表格渲染很慢，暂时不知道什么原因
    await this.$nextTick();
    this.refreshTable();
    this.bindKeyboard();
    this.setTableScroll();
    (this.$refs.vxeTable as Table).focus();
  },

  beforeRouteLeave(to, from, next): void {
    this.unBindKeyboard();
    this.storageTableScroll();
    next();
  },

  methods: {
    readLastExcel(): void {
      readLastFile().then(() => {
        this.refreshTable();
      });
    },

    createTask(): void {
      this.$router.push('/edit-task');
    },

    refreshTable(): void {
      const workbookMap: WorkbookMap = store.getters.workbookMap();
      if (workbookMap.size === 0) {
        this.readLastExcel();
        return;
      }

      const taskList = workbookMap.get('task');

      if (taskList) {
        try {
          this.tableData = cloneDeep(taskList);

          if (this.$refs.vxeTable) {
            (this.$refs.vxeTable as Table).updateData().then(() => {
              if (this.afterRefreshTable) {
                this.afterRefreshTable().then(
                  () => (this.afterRefreshTable = null)
                );
              }
            });
          }
        } catch (error) {
          this.$notify.warning({
            title: '刷新数据失败',
            message: 'this.$refs.vxeTable is undefined',
            position: 'bottom-right',
          });
        }
      }
    },

    updateRow(index: number): void {
      const row = this.tableData[index];
      store.commit('updateTaskId', row.id);
      this.$router.push('/edit-task');
    },

    doubleTask(): void {
      this.copySelection();
      this.pasteTask();
    },

    copySelection(): void {
      const checkList = (this.$refs.vxeTable as Table).getCheckboxRecords();

      // if (this.tableHeight !== 0) return;
      this.tableSelection = checkList;
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
          const task = taskjson.find(
            (item) => item.id.toString() === id.toString()
          );
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
    },

    getAwardList(award: string): Record<string, string>[] | undefined {
      const idList = award.split(',');
      const workbookMap: Map<SheetName, Record<string, string>[]> =
        store.state.workbookMap;
      const awardjson = workbookMap.get('award_data');
      if (awardjson) {
        return awardjson.filter((item) => idList.includes(item.award_id));
      }
    },

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

        if (
          taskjson &&
          processjson &&
          sourcejson &&
          conditionjson &&
          awardjson
        ) {
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

          // 复制的任务数据需要为每一条赋新的uuid
          taskjson.uuid = uuid();
          processjson.uuid = uuid();
          sourcejson.forEach((s) => (s.uuid = uuid()));
          conditionjson.forEach((c) => (c.uuid = uuid()));
          awardjson.forEach((a) => (a.uuid = uuid()));

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

      this.refreshTable();
      this.afterRefreshTable = this.afterPasteTask;
      // 延迟写入，不影响表格重绘
      setTimeout(writeMapToExcel, 1000, workbookMap);
    },

    /**
     * 复制粘贴任务数据后，将滚动条自动滚动到底部
     * 并选中复制的任务
     */
    afterPasteTask(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        const copyTaskList = store.state.copyTaskList;
        if (copyTaskList && copyTaskList.length !== 0) {
          const length = copyTaskList.length;
          const scrollIndex = this.tableData.length - length;

          // 将粘贴的任务设置为勾选状态
          const rows: RowInfo[] = [];
          for (
            let index = scrollIndex;
            index < this.tableData.length;
            index++
          ) {
            const element = this.tableData[index];
            rows.push(element);
          }
          (this.$refs.vxeTable as Table).setCheckboxRow(rows, true).then(() => {
            // 滚动到粘贴第一个任务的位置
            const row = (this.$refs.vxeTable as Table).getData(
              this.tableData.length - 1
            );
            setTimeout(() => {
              (this.$refs.vxeTable as Table).scrollToRow(row).then(() => {
                resolve();
              });
            }, 500);
          });
        }
        reject();
      });
    },

    tableKeydown(event: InterceptorKeydownParams): void {
      const $event: KeyboardEvent = event.$event;
      $event.preventDefault();
      $event.stopPropagation();

      if ($event.code === 'Space') {
        const $table = event.$table;
        const row = $table.getCurrentRecord();
        $table.toggleCheckboxRow(row);
      }
    },

    checkboxChange(data: Record<string, never>): void {
      const checked: boolean = data.checked;
      if (checked) {
        if (this.lastChecked) {
          const event: MouseEvent = data.$event;
          if (event.shiftKey) {
            const rowIndex: number = data.rowIndex;
            const rowIndexLast: number = this.lastChecked.rowIndex;
            const max = Math.max(rowIndex, rowIndexLast);
            const min = Math.min(rowIndex, rowIndexLast);
            const rows: RowInfo[] = [];
            for (let index = min; index <= max; index++) {
              const row = (this.$refs.vxeTable as Table).getData(index);
              rows.push(row);
            }
            (this.$refs.vxeTable as Table).setCheckboxRow(rows, true);
          } else {
            this.lastChecked = data;
          }
        } else {
          this.lastChecked = data;
        }
      } else {
        if (this.lastUnChecked) {
          const event: MouseEvent = data.$event;
          if (event.shiftKey && event.altKey) {
            const rowIndex: number = data.rowIndex;
            const rowIndexLast: number = this.lastUnChecked.rowIndex;
            const max = Math.max(rowIndex, rowIndexLast);
            const min = Math.min(rowIndex, rowIndexLast);
            const rows: RowInfo[] = [];
            for (let index = min; index <= max; index++) {
              const row = (this.$refs.vxeTable as Table).getData(index);
              rows.push(row);
            }
            (this.$refs.vxeTable as Table).setCheckboxRow(rows, false);
          } else {
            this.lastUnChecked = data;
          }
        } else {
          this.lastUnChecked = data;
        }
      }
    },

    bindKeyboard(): void {
      bind(
        'ctrl+o',
        () => {
          this.treeDialog = true;
          return false;
        },
        'keydown'
      );
      bind(
        'f5',
        () => {
          this.refreshTable();
          return false;
        },
        'keydown'
      );
      bind(
        'ctrl+n',
        () => {
          this.createTask();
          return false;
        },
        'keydown'
      );
      bind(
        'ctrl+c',
        () => {
          this.copySelection();
          return false;
        },
        'keydown'
      );
      bind(
        'ctrl+v',
        () => {
          this.pasteTask();
          return false;
        },
        'keydown'
      );
      bind(
        'ctrl+d',
        () => {
          this.doubleTask();
          return false;
        },
        'keydown'
      );
    },

    unBindKeyboard(): void {
      unbind('ctrl+o', 'keydown');
      unbind('f5', 'keydown');
      unbind('ctrl+n', 'keydown');
      unbind('ctrl+c', 'keydown');
      unbind('ctrl+v', 'keydown');
      unbind('ctrl+d', 'keydown');
    },

    storageTableScroll(): void {
      const scroll = (this.$refs.vxeTable as Table).getScroll();
      store.commit('taskTableScroll', scroll);
    },

    setTableScroll(): Promise<void> {
      const scroll = store.state.taskTableScroll;
      if (scroll) {
        return (this.$refs.vxeTable as Table).scrollTo(
          scroll.scrollLeft,
          scroll.scrollTop
        );
      }
      return Promise.reject();
    },
  },
});
</script>
