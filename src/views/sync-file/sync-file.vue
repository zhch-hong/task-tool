<template>
  <div class="sync-file">
    <WorkspaceExcel @click-file="clickFile" />
    <div ref="SheetTabs" class="sheet-tabs">
      <div class="tabs-warp">
        <el-tabs v-model="activeName" type="border-card">
          <el-tab-pane v-for="(value, key) of data" :key="key" :label="key" :name="key" lazy>
            <TableView :ref="key" :columns="value.columns" :data="value.data" @undo="addUndo" />
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
import { bind, unbind } from 'mousetrap';
import { excel2json } from './scripts/excel2json';
import { SyncFileModule } from '@/store/modules/sync-file';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { closeSync } from '@/menu/Edit/SyncFile';
import { Loading } from 'element-ui';
import { KeyboardEventModule } from '@/store/modules/keyboard-event';
import { syncFile } from '@/menu/Edit/SyncFile';

import TableView from './components/TableView.vue';
import WorkspaceExcel from './components/WorkspaceExcel.vue';

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
      activeName: '',
      activePath: '',
      activeVueComponent: null as Vue | null,
      undoMap: new Map<string, Array<Record<string, any>>>(),
      redoMap: new Map<string, Array<Record<string, any>>>(),
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

    activeName: {
      immediate: true,
      handler(value?: string) {
        if (typeof value === 'undefined') return;

        this.$nextTick(() => {
          const ref = this.$refs[value] as Vue[] | undefined;

          if (ref) {
            const vue = ref[0];
            this.activeVueComponent = vue;
          }
        });
      },
    },
  },

  created() {
    this.bindKeyboard();

    KeyboardEventModule.registerKeyboard({ key: 'ctrl+z', handles: [this.undo] });
    KeyboardEventModule.registerKeyboard({ key: 'ctrl+y', handles: [this.redo] });
    KeyboardEventModule.registerKeyboard({ key: 'ctrl+t', handles: [syncFile] });
    KeyboardEventModule.registerKeyboard({
      key: 'f3',
      handles: [
        () => {
          if (this.activeVueComponent) {
            (this.activeVueComponent as any).findNext();
          }
        },
      ],
    });
    KeyboardEventModule.registerKeyboard({
      key: 'shift+f3',
      handles: [
        () => {
          if (this.activeVueComponent) {
            (this.activeVueComponent as any).findPrev();
          }
        },
      ],
    });
    KeyboardEventModule.registerKeyboard({
      key: 'ctrl+f',
      handles: [
        () => {
          if (this.activeVueComponent) {
            (this.activeVueComponent as any).showSearch = true;
          }
        },
      ],
    });
    KeyboardEventModule.registerKeyboard({
      key: 'esc',
      handles: [
        () => {
          if (this.activeVueComponent) {
            (this.activeVueComponent as any).showSearch = false;
          }
        },
      ],
    });
  },

  beforeRouteLeave(to, from, next): void {
    this.unBindKeyboard();

    KeyboardEventModule.unregisterKeyboard('ctrl+z');
    KeyboardEventModule.unregisterKeyboard('ctrl+y');
    KeyboardEventModule.unregisterKeyboard('ctrl+t');
    KeyboardEventModule.unregisterKeyboard('f3');
    KeyboardEventModule.unregisterKeyboard('shift+f3');
    KeyboardEventModule.unregisterKeyboard('ctrl+f');
    KeyboardEventModule.unregisterKeyboard('esc');

    next();
  },

  methods: {
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
        this.activeName = Object.keys(object)[0];

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

          if (Array.isArray(element)) {
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

    addUndo(payload: Record<string, any>): void {
      const list = this.undoMap.get(this.activeName);
      const redoList = this.redoMap.get(this.activeName);

      if (redoList) {
        redoList.splice(0);
      }

      if (list) {
        list.push(payload);
      } else {
        this.undoMap.set(this.activeName, [payload]);
      }
    },

    undo() {
      const list = this.undoMap.get(this.activeName);

      if (list) {
        const obj = list.pop();
        if (obj) {
          obj.row[obj.property] = obj.oldValue;

          // 将撤销的数据逐一添加到恢复集合
          const redoList = this.redoMap.get(this.activeName);
          if (redoList) {
            redoList.push(obj);
          } else {
            this.redoMap.set(this.activeName, [obj]);
          }
        }
      }
    },

    redo() {
      const list = this.redoMap.get(this.activeName);

      if (list) {
        const obj = list.pop();
        if (obj) {
          obj.row[obj.property] = obj.value;

          // 将恢复的数据逐一添加到撤销集合
          const undoList = this.undoMap.get(this.activeName);
          if (undoList) {
            undoList.push(obj);
          } else {
            this.undoMap.set(this.activeName, [obj]);
          }
        }
      }
    },

    bindKeyboard(): void {
      bind(
        'ctrl+z',
        () => {
          this.undo();
          return false;
        },
        'keypress'
      );
      bind(
        'ctrl+y',
        () => {
          this.redo();
          return false;
        },
        'keypress'
      );
      bind('ctrl+t', syncFile, 'keypress');
      bind(
        'f3',
        () => {
          if (this.activeVueComponent) {
            (this.activeVueComponent as any).findNext();
          }

          return false;
        },
        'keydown'
      );
      bind(
        'shift+f3',
        () => {
          if (this.activeVueComponent) {
            (this.activeVueComponent as any).findPrev();
          }

          return false;
        },
        'keydown'
      );
      bind(
        'ctrl+f',
        () => {
          if (this.activeVueComponent) {
            (this.activeVueComponent as any).showSearch = true;
          }

          return false;
        },
        'keydown'
      );
      bind(
        'esc',
        () => {
          if (this.activeVueComponent) {
            (this.activeVueComponent as any).showSearch = false;
          }

          return false;
        },
        'keydown'
      );
    },

    unBindKeyboard(): void {
      unbind('ctrl+z', 'keypress');
      unbind('ctrl+y', 'keypress');
      unbind('ctrl+t', 'keypress');
      unbind('f3', 'keydown');
      unbind('shift+f3', 'keydown');
      unbind('ctrl+f', 'keydown');
      unbind('esc', 'keydown');
    },
  },
});
</script>
<style lang="scss" scoped>
div.sync-file {
  height: 100%;
  display: flex;
  & > div.sheet-tabs {
    flex-grow: 1;
    position: relative;
    div.tabs-warp {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
}
</style>
