<template>
  <div>
    <vxe-toolbar perfect>
      <template v-slot:buttons>
        <el-button size="mini" style="margin-left: 10px" @click="doingSync">同步数据</el-button>
        <el-button size="mini" @click="undoSync">取消同步</el-button>
      </template>
    </vxe-toolbar>
    <SheetTabs />
    <div v-for="(value, key) of jsonMap" :key="key" style="margin: 20px 10px 20px">
      <h2>{{ key }}</h2>
      <TableView :ref="'ref_' + key" :columns="value.columns" :data="value.data" :active-pane="activePane" />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import XLSX from 'xlsx';

import { excel2json } from './scripts/excel2json';
import { ViewResizeModule } from '@/store/modules/veiw-resize';

import TableView from './components/TableView.vue';
import SyncFileList from './components/SyncFileList.vue';
import SheetTabs from './components/SheetTabs.vue';

export default Vue.extend({
  name: 'sync-file',

  components: {
    TableView,
    SheetTabs,
  },

  props: {
    path: String,
  },

  data() {
    return {
      activePane: '',
      jsonMap: {} as Record<string, Record<string, Array<Record<string | number, any>>>>,
    };
  },

  computed: {
    tabPaneHeight(): string {
      return ViewResizeModule.windowHeight - 200 + 'px';
    },
  },

  created(): void {
    const map = excel2json(this.path);
    const object: Record<string, Record<string, Array<Record<string | number, any>>>> = {};
    map.forEach((value, key) => {
      object[key] = value;
    });

    this.activePane = Object.keys(this.jsonMap)[1];
    this.$nextTick(() => {
      this.jsonMap = object;
    });
  },

  methods: {
    doingSync(): void {
      this.getSyncFileList()
        .then((pathList) => {
          const map = new Map<string, Map<string, Record<'o' | 'n', any>>>();
          const object = this.$refs;
          for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
              const element = object[key] as any;
              const records = (element[0] as any).getUpdateRecords();
              map.set(key.substring(4), records);
            }
          }

          pathList.forEach((path) => this.syncingFile(path, map));
        })
        .catch(() => {
          //
        });
    },

    undoSync(): void {
      this.$router.back();
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
            if (cell) {
              cell.v = value.n;
              cell.w = value.n.toString();
            }
          });
        }
      });

      XLSX.writeFile(workbook, path);
    },

    getSyncFileList(): Promise<string[]> {
      return new Promise<string[]>((resolve, reject) => {
        const div = document.createElement('div');
        document.body.append(div);
        const instance = new SyncFileList();
        instance.$mount(div);

        instance.$on('close', () => {
          instance.$el.remove();
          instance.$nextTick(() => {
            instance.$destroy();
            reject();
          });
        });

        instance.$on('path-list', (pathList: string[]) => {
          resolve(pathList);
        });
      });
    },
  },
});
</script>
