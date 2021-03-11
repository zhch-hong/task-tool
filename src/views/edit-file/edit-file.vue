<template>
  <div class="edit-file">
    <FileTree @update:table="refreshTable" @render-table="$refs.vxeTable.recalculate()" />
    <div class="content">
      <div class="position">
        <vxe-table
          ref="vxeTable"
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
        >
          <vxe-table-column type="seq" width="60"></vxe-table-column>
          <vxe-table-column type="checkbox" width="60" align="center"></vxe-table-column>
          <vxe-table-column field="id" title="ID" width="100" align="center"></vxe-table-column>
          <vxe-table-column field="name" title="名称"></vxe-table-column>
          <vxe-table-column field="enable" title="启用" width="60"></vxe-table-column>
          <vxe-table-column field="is_reset" title="重置" width="60"></vxe-table-column>
          <vxe-table-column field="own_type" title="类型"></vxe-table-column>
          <vxe-table-column field="task_enum" title="枚举"></vxe-table-column>
          <vxe-table-column field="任务内容说明" title="任务内容说明"></vxe-table-column>
          <vxe-table-column width="100">
            <template #default="{ rowIndex }">
              <el-button size="mini" icon="el-icon-edit" @click="updateRow(rowIndex)">修改</el-button>
            </template>
          </vxe-table-column>
        </vxe-table>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { cloneDeep } from 'lodash';
import { InterceptorKeydownParams, RowInfo, Table } from 'vxe-table';
import { bind, unbind, trigger } from 'mousetrap';
import { v4 as uuid } from 'uuid';
import { readLastFile } from '@/utils';
import { WorkspacedModule } from '@/store/modules/workspaced';
import {
  getLostAwardId,
  getLostConditionId,
  getLostProcessId,
  getLostSourceId,
  getLostTaskId,
} from '@/store/modules/lost-id';
import { TableScrollModule } from '@/store/modules/table-scroll';
import { CopyTaskModule } from '@/store/modules/copy-task';
import { ActiveTaskModule } from '@/store/modules/active-task';
import { ActiveFileModule } from '@/store/modules/active-file';
import { ChangedMapModule } from '@/store/modules/changed-map';
import { ViewResizeModule } from '@/store/modules/veiw-resize';
import { deleteExisting } from '@/utils';
import { KeyboardEventModule } from '@/store/modules/keyboard-event';
import { Loading } from 'element-ui';

export default Vue.extend({
  name: 'EditFile',
  components: {
    FileTree: () => import('./components/FileTree.vue'),
  },
  data() {
    return {
      tableData: [] as Record<string, string>[],
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
    tableHeight(): number {
      return ViewResizeModule.windowHeight - 30;
      // return ViewResizeModule.windowHeight - 62;
    },

    updateCount(): number {
      return ActiveFileModule.updateCount;
    },
  },

  watch: {
    updateCount: {
      handler(value: number) {
        // 值为0说明是新打开的文件，不是文件内容被更新
        if (value === 0) {
          return;
        }

        this.refreshTable();
      },
    },
  },

  created() {
    this.registerKeyboard();
  },

  async mounted(): Promise<void> {
    this.afterRefreshTable = this.setTableScroll;
    // 这里加上$nextTick，不然路由跳转的等待时间会大大加长，表格渲染很慢，暂时不知道什么原因
    await this.$nextTick();
    this.refreshTable();
    this.bindKeyboard();
    this.setTableScroll()
      .then(() => {
        //
      })
      .catch(() => {
        //
      });
    (this.$refs.vxeTable as Table).focus();
  },

  beforeRouteLeave(to, from, next): void {
    this.unBindKeyboard();
    this.unregisterKeyboard();
    this.storageTableScroll();
    next();
  },

  methods: {
    registerKeyboard(): void {
      KeyboardEventModule.registerKeyboard({ key: 'f5', handles: [this.refreshTable] });
      KeyboardEventModule.registerKeyboard({ key: 'ctrl+r', handles: [this.deleteTask] });
      KeyboardEventModule.registerKeyboard({ key: 'ctrl+c', handles: [this.copySelection] });
      KeyboardEventModule.registerKeyboard({ key: 'ctrl+v', handles: [this.pasteTask] });
      KeyboardEventModule.registerKeyboard({ key: 'ctrl+d', handles: [this.doubleTask] });
    },
    unregisterKeyboard(): void {
      KeyboardEventModule.unregisterKeyboard('f5');
      KeyboardEventModule.unregisterKeyboard('ctrl+r');
      KeyboardEventModule.unregisterKeyboard('ctrl+c');
      KeyboardEventModule.unregisterKeyboard('ctrl+v');
      KeyboardEventModule.unregisterKeyboard('ctrl+d');
    },
    readLastExcel(): void {
      readLastFile()
        .then(() => {
          this.refreshTable();
        })
        .catch(() => {
          //
        });
    },

    refreshTable(): void {
      const loading = Loading.service({
        target: (this.$refs.vxeTable as Vue).$el as HTMLDivElement,
        lock: true,
        text: '正在加载',
        spinner: 'el-icon-loading',
        customClass: 'custom-loading-class',
      });

      setTimeout(async () => {
        await this.$nextTick();

        const path = ActiveFileModule.path;

        if (!path) {
          loading.close();
          this.readLastExcel();
          return;
        }

        const workbookMap = await WorkspacedModule.bookMapByPath(path);

        const taskList = workbookMap.get('task');

        if (taskList) {
          try {
            this.tableData = cloneDeep(taskList);

            await this.$nextTick();

            loading.close();

            // 表格刷新数后需要做的操作
            if (this.$refs.vxeTable) {
              (this.$refs.vxeTable as Table).updateData().then(() => {
                if (this.afterRefreshTable) {
                  this.afterRefreshTable()
                    .then(() => (this.afterRefreshTable = null))
                    .catch(() => {
                      //
                    });
                }
              });
            }
          } catch (error) {
            //
          }
        } else {
          loading.close();
        }
      }, 150);
    },

    updateRow(index: number): void {
      const row = this.tableData[index];
      ActiveTaskModule.SET_TASKID(row.id);

      this.$nextTick(() => {
        // 编程式触发快捷键
        trigger('ctrl+n', 'keydown');
        // setTimeout(() => {
        // }, 1000);
      });
    },

    doubleTask(): void {
      this.copySelection().then(() => {
        this.pasteTask();
      });
    },

    copySelection(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        const checkList = (this.$refs.vxeTable as Table).getCheckboxRecords();
        this.tableSelection = checkList;
        const idList = this.tableSelection.map((task) => task.id);

        if (idList.length === 0) {
          return;
        }

        const path = ActiveFileModule.path;
        WorkspacedModule.bookMapByPath(path)
          .then((workbookMap) => {
            const taskjson = workbookMap.get('task');
            const processjson = workbookMap.get('process_data');
            const sourcejson = workbookMap.get('source');
            const conditionjson = workbookMap.get('condition');
            const awardjson = workbookMap.get('award_data');

            const copyList: Record<string, Record<string, string> | Record<string, string>[]>[] = [];
            if (taskjson && processjson && sourcejson && conditionjson && awardjson) {
              idList.forEach(async (id, index) => {
                const object: Record<string, Record<string, string> | Record<string, string>[]> = {};
                const task = taskjson.find((item) => item.id.toString() === id.toString());
                if (task) {
                  object['task'] = task;

                  const { process_id } = task;
                  const process = processjson.find((item) => item.process_id === process_id);

                  if (process) {
                    object['process'] = process;

                    const { awards, source_id } = process;

                    const awardList = await this.getAwardList(awards);

                    if (awardList) object['awards'] = awardList;

                    object['source'] = sourcejson.filter((item) => item.source_id === source_id);
                    const conditionidList = object.source.map((item) => item.condition_id);

                    object['condition'] = conditionjson.filter((item) => conditionidList.includes(item.condition_id));
                  } else {
                    reject();
                  }
                } else {
                  reject();
                }

                copyList.push(object);

                if (index === idList.length - 1) {
                  CopyTaskModule.SET_TASKLIST(copyList);
                  resolve();
                }
              });
            } else {
              reject(new Error('工作表缺失'));
            }
          })
          .catch((error: Error) => reject(error));
      });
    },

    async getAwardList(award: string): Promise<Record<string, string>[] | undefined> {
      const idList = award.split(',');
      const path = ActiveFileModule.path;
      const workbookMap = await WorkspacedModule.bookMapByPath(path);
      const awardjson = workbookMap.get('award_data');

      if (awardjson) {
        return awardjson.filter((item) => idList.includes(item.award_id.toString()));
      }
    },

    async pasteTask(): Promise<void> {
      let copyTaskList = CopyTaskModule.taskList;

      copyTaskList = cloneDeep(copyTaskList);
      if (!copyTaskList) {
        this.$message.info('尚未拷贝任务');
        return;
      }

      const path = ActiveFileModule.path;
      const workbookMap = await WorkspacedModule.bookMapByPath(path);

      copyTaskList.forEach((copyTask: Record<string, any>) => {
        const taskjson = copyTask.task as Record<string, string>;
        const processjson = copyTask.process as Record<string, string>;
        const sourcejson = copyTask.source as Record<string, string>[];
        const conditionjson = copyTask.condition as Record<string, string>[];
        const awardjson = copyTask.awards as Record<string, string>[];

        if (taskjson && processjson && sourcejson && conditionjson && awardjson) {
          taskjson.id = getLostTaskId();

          const newProcessid = getLostProcessId();
          const newSourceid = getLostSourceId();

          taskjson.process_id = newProcessid;
          processjson.process_id = newProcessid;
          processjson.source_id = newSourceid;

          const newAwardid: string[] = [];
          processjson.awards.split(',').forEach((award_id) => {
            const _award_id = getLostAwardId();
            newAwardid.push(_award_id);
            awardjson.forEach((award) => {
              if (award.award_id == award_id) award.award_id = _award_id;
            });
          });
          processjson.awards = newAwardid.join(',');

          sourcejson.forEach((source) => {
            source.source_id = newSourceid;

            const newConditionid = getLostConditionId();
            conditionjson
              .filter((c) => c.condition_id == source.condition_id)
              .forEach((c) => (c.condition_id = newConditionid));
            source.condition_id = newConditionid;
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

      ChangedMapModule.Append({
        path: ActiveFileModule.path,
        data: workbookMap,
      });

      this.refreshTable();
      this.afterRefreshTable = this.afterPasteTask;
    },

    /**
     * 复制粘贴任务数据后，将滚动条自动滚动到底部
     * 并选中复制的任务
     */
    afterPasteTask(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        const copyTaskList = CopyTaskModule.taskList;
        if (copyTaskList && copyTaskList.length !== 0) {
          const length = copyTaskList.length;
          const scrollIndex = this.tableData.length - length;

          // 将粘贴的任务设置为勾选状态
          const rows: RowInfo[] = [];
          for (let index = scrollIndex; index < this.tableData.length; index++) {
            const element = this.tableData[index];
            rows.push(element);
          }
          (this.$refs.vxeTable as Table).setCheckboxRow(rows, true).then(() => {
            // 滚动到粘贴第一个任务的位置
            const row = (this.$refs.vxeTable as Table).getData(this.tableData.length - 1);
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

    async deleteTask(): Promise<void> {
      const checkList = (this.$refs.vxeTable as Table).getCheckboxRecords();

      if (checkList.length !== 0) {
        const path = ActiveFileModule.path;
        const map = await WorkspacedModule.bookMapByPath(path);
        const taskList = map.get('task')!;
        const processList = map.get('process_data')!;
        const sourceList = map.get('source')!;
        const conditionList = map.get('condition')!;
        const awardList = map.get('award_data')!;
        checkList.forEach((task) => {
          const taskId: string = task.id;
          const processId: string = task.process_id;
          let sourceId = '';
          let conditionIdList: string[] = [];
          let awardIdList: string[] = [];

          const process = processList.find((p) => p.process_id == processId);
          if (process) {
            sourceId = process.source_id;
            conditionIdList = sourceList.filter((s) => s.source_id == sourceId).map((s) => s.condition_id);

            awardIdList = process.awards.split(',');
          }

          deleteExisting(taskList, 'id', taskId);
          deleteExisting(processList, 'process_id', processId);
          deleteExisting(sourceList, 'source_id', sourceId);
          conditionIdList.forEach((id) => deleteExisting(conditionList, 'condition_id', id));
          awardIdList.forEach((id) => deleteExisting(awardList, 'award_id', id));
        });

        ChangedMapModule.Append({ path: path, data: map });

        this.refreshTable();
      }
    },

    bindKeyboard(): void {
      bind(
        'f5',
        () => {
          this.refreshTable();
          return false;
        },
        'keydown'
      );
      bind(
        'ctrl+r',
        () => {
          this.deleteTask();
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
      unbind('f5', 'keydown');
      unbind('delete', 'keydown');
      unbind('ctrl+c', 'keydown');
      unbind('ctrl+v', 'keydown');
      unbind('ctrl+d', 'keydown');
    },

    storageTableScroll(): void {
      const scroll = (this.$refs.vxeTable as Table).getScroll();
      TableScrollModule.SET_SCROLL(scroll);
    },

    setTableScroll(): Promise<void> {
      const scroll = TableScrollModule.scroll;
      if (scroll) {
        return (this.$refs.vxeTable as Table).scrollTo(scroll.scrollLeft as number, scroll.scrollTop as number);
      }
      return Promise.reject();
    },
  },
});
</script>
<style lang="scss" scoped>
div.edit-file {
  height: 100%;
  display: flex;
  & > div.content {
    flex-grow: 1;
    position: relative;
    & > div.position {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
