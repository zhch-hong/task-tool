<template>
  <div class="sync-file">
    <div class="tree-view">
      <WorkspaceExcel @click-file="clickFile" />
    </div>
    <div ref="SheetTabs" class="sheet-tabs">
      <div class="tabs-warp">
        <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
          <el-tab-pane v-for="(value, key) of data" :key="key" :label="key" lazy>
            <TableView :ref="key" :columns="value.columns" :data="value.data" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import XLSX from 'xlsx';
import { remote } from 'electron';
import { excel2json } from './scripts/excel2json';
import { SyncFileModule } from '@/store/modules/sync-file';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { closeSync } from '@/menu/Edit/SyncFile';
import { Loading } from 'element-ui';

import TableView from './components/TableView.vue';
import WorkspaceExcel from '@/components/WorkspaceExcel.vue';

const { dialog, getCurrentWindow } = remote;

export default Vue.extend({
  name: 'SyncFile',

  components: {
    TableView,
    WorkspaceExcel,
  },

  data() {
    return {
      data: {} as Record<PropertyKey, any>,
      activeName: '0',
      activePath: '',
    };
  },

  computed: {
    pathList(): string[] {
      return SyncFileModule.pathList;
    },
  },

  watch: {
    /**
     * 当点击同步文件时，会向vuex中提交勾选的文件路径
     * 这里便进行同步操作
     */
    pathList: {
      deep: true,
      handler(list: string[]) {
        if (list.length === 0) return;

        this.startSync(list);
      },
    },
  },

  methods: {
    handleClick(name: string): void {
      // console.log(name);
    },

    async clickFile(path: string): Promise<void> {
      this.data = {};
      const loading = Loading.service({
        target: this.$refs.SheetTabs as HTMLDivElement,
        lock: true,
        text: '正在加载',
        spinner: 'el-icon-loading',
        customClass: 'custom-loading-class',
      });
      await this.$nextTick();
      setTimeout(() => {
        this.activeName = '0';
        this.activePath = path;
        const map = excel2json(path);
        const object: Record<string, Record<string, Array<Record<string | number, any>>>> = {};
        map.forEach((value, key) => {
          object[key] = value;
        });

        this.data = object;

        const split = path.split('\\');
        const fileName = split[split.length - 1];
        SyncFileModule.setFileName(fileName);
        setTimeout(() => {
          this.$nextTick(() => loading.close());
        }, 500);
      }, 100);
    },

    startSync(pathList: string[]): void {
      const map = new Map<string, Map<string, Record<'o' | 'n', any>>>();
      const object = this.$refs;

      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          const element = object[key] as any;
          if (Array.isArray(object)) {
            const el = element[0];
            if (el && typeof el.getUpdateRecords === 'function') {
              const records = el.getUpdateRecords();
              map.set(key, records);
            }
          } else {
            const el = element;
            if (el && typeof el.getUpdateRecords === 'function') {
              const records = el.getUpdateRecords();
              map.set(key, records);
            }
          }
        }
      }

      pathList.forEach((path) => this.syncingFile(path, map));

      // 更新WorkspacedModule中的数据
      const iterator = WorkspacedModule.readedPathList();
      for (const ite of iterator) {
        if (pathList.includes(ite)) {
          WorkspacedModule.UpdateWorkbookmap({ path: ite });
        }
      }

      // 更新表格数据
      this.$nextTick(async () => {
        this.clickFile(this.activePath);
        await this.$nextTick();
        const win = getCurrentWindow();
        win.focus();
        dialog.showMessageBoxSync(win, {
          title: '同步完成',
          message: '更新的单元格数据已全部同步至所选文件',
          type: 'info',
        });
        closeSync();
      });
    },

    syncingFile(path: string, records: Map<string, Map<string, Record<'o' | 'n', any>>>) {
      const columns = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
      ];
      const workbook = XLSX.readFile(path);
      records.forEach((recordMap, sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        if (sheet) {
          recordMap.forEach((value, address) => {
            const _address = JSON.parse(address);
            const cellAddress = columns[_address.c] + (_address.r + 2);
            const cell: XLSX.CellObject = sheet[cellAddress];

            if (!cell) {
              const ref = sheet['!ref'];

              if (ref) {
                const range = XLSX.utils.decode_range(ref);

                if (range.e.c < _address.c + 1) {
                  range.e.c = _address.c + 1;
                }

                if (range.e.r < _address.r + 2) {
                  range.e.r = _address.r + 2;
                }

                sheet['!ref'] = XLSX.utils.encode_range(range);
                sheet[cellAddress] = {
                  h: value.n.toString(),
                  t: 's',
                  v: value.n.toString(),
                  w: value.n.toString(),
                };
              }
            } else {
              cell.h = value.n.toString();
              cell.t = 's';
              cell.v = value.n.toString();
              cell.w = value.n.toString();
            }
          });
        }
      });

      XLSX.writeFile(workbook, path);
    },
  },
});
</script>
<style lang="scss" scoped>
div.sync-file {
  height: 100%;
  display: flex;
  & > div.tree-view {
    width: 400px;
    box-shadow: 0 0 1px 0 #cce4ff;
  }
  & > div.sheet-tabs {
    flex-grow: 1;
    position: relative;
    & > div.tabs-warp {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
