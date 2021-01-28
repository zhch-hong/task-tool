<template>
  <vxe-table
    ref="xTable"
    border
    keep-source
    show-overflow="title"
    show-header-overflow="title"
    :max-height="tableHeight"
    :data="tableData"
    :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
    @edit-closed="editClosed"
    @edit-actived="editActived"
  >
    <vxe-table-column
      v-for="col in columns"
      :key="col.field || col.title"
      :field="col.field"
      :title="col.title"
      :min-width="200"
      :edit-render="{ name: 'input' }"
    ></vxe-table-column>
  </vxe-table>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import { cloneDeep } from 'lodash';
import { ViewResizeModule } from '@/store/modules/veiw-resize';

export default Vue.extend({
  name: 'TableView',

  props: {
    columns: {
      type: Array as PropType<Record<string, string>[]>,
      required: true,
    },

    data: {
      type: Array as PropType<Array<Record<string, any>>>,
      default: () => [],
    },

    activePane: String,
  },

  data() {
    return {
      tableData: cloneDeep(this.data) as Record<PropertyKey, string>[],
      editCellValue: '',
      editRecords: new Map<string, Record<'o' | 'n', any>>(),
    };
  },

  computed: {
    tableHeight(): string {
      return ViewResizeModule.windowHeight - 300 + 'px';
    },
  },

  watch: {
    activePane: {
      immediate: true,
      handler() {
        this.$forceUpdate();
      },
    },
  },

  created(): void {
    // console.log('created');
  },

  methods: {
    getUpdateRecords() {
      return this.editRecords;
    },

    editClosed(payload: Record<string, any>) {
      const rowIndex = payload.rowIndex as number;
      const columnIndex = payload.columnIndex as number;

      const property = payload.column.property as string;
      const row = payload.row as Record<string, any>;
      const value = row[property];

      if (value != this.editCellValue) {
        this.editRecords.set(JSON.stringify({ r: rowIndex, c: columnIndex }), { o: this.editCellValue, n: value });
      } else {
        this.editRecords.delete(JSON.stringify({ r: rowIndex, c: columnIndex }));
      }
    },

    editActived(payload: Record<string, any>) {
      const property = payload.column.property as string;
      const row = payload.row as Record<string, any>;
      const value = row[property];
      const rowIndex = payload.rowIndex as number;
      const columnIndex = payload.columnIndex as number;

      const mapValue = this.findExist({ r: rowIndex, c: columnIndex });

      if (mapValue) {
        this.editCellValue = mapValue.o;
      } else {
        this.editCellValue = value;
      }
    },

    findExist(address: { r: number; c: number }) {
      return this.editRecords.get(JSON.stringify(address));
    },
  },
});
</script>
