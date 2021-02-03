<template>
  <div>
    <v-toolbar>
      <v-btn small tile style="margin-right: 20px" @click="doingSync">同步数据</v-btn>
      <v-btn small tile @click="undoSync">关闭同步</v-btn>
      <template #extension>
        <v-tabs v-model="activePane">
          <v-tab v-for="(value, key) of jsonMap" :key="key">
            {{ key }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <v-tabs-items v-model="activePane">
      <v-tab-item v-for="(value, key) of jsonMap" :key="key">
        <TableView :ref="'ref_' + key" :columns="value.columns" :data="value.data" />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import XLSX from 'xlsx';

import { excel2json } from './scripts/excel2json';
import { ViewResizeModule } from '@/store/modules/veiw-resize';

import TableView from './components/TableView.vue';
import SyncFileList from './components/SyncFileList.vue';

export default Vue.extend({
  name: 'sync-file',

  components: {
    TableView,
  },

  props: {
    path: String,
  },

  data() {
    return {
      activePane: 0,
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

    this.$nextTick(() => {
      this.jsonMap = object;
    });
  },

  methods: {
    doingSync(): void {
      this.getSyncFileList()
        .then(({ pathList, cb }) => {
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

          cb();
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

    getSyncFileList(): Promise<{ pathList: string[]; cb: () => void }> {
      return new Promise<{ pathList: string[]; cb: () => void }>((resolve, reject) => {
        const div = document.createElement('div');
        document.body.append(div);
        const instance = new SyncFileList();

        const path: string = this.$route.params.path;
        const split = path.split('\\');
        instance.fileName = split[split.length - 1];

        instance.$mount(div);

        instance.$on('close', () => {
          instance.$el.remove();
          instance.$nextTick(() => {
            instance.$destroy();
            reject();
          });
        });

        instance.$on('path-list', (payload: { pathList: string[]; cb: () => void }) => {
          resolve(payload);
        });
      });
    },
  },
});
</script>
