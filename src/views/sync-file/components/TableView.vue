<template>
  <vxe-table
    ref="xTable"
    border
    keep-source
    show-overflow="title"
    show-header-overflow="title"
    :height="tableHeight"
    :data="tableData"
    :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true, icon: 'none' }"
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
  },

  data() {
    return {
      tableData: [] as Record<PropertyKey, string>[],
      editBeforeValue: '',
      editRecords: new Map<string, Record<'o' | 'n', any>>(),
      sourceCellValue: '',
    };
  },

  computed: {
    tableHeight(): string {
      return ViewResizeModule.windowHeight - 71 + 'px';
    },
  },

  mounted() {
    setTimeout(() => {
      this.tableData = cloneDeep(this.data);
    }, 500);
  },

  methods: {
    getUpdateRecords() {
      return this.editRecords;
    },

    editActived(payload: Record<string, any>) {
      // 用于撤销/恢复
      const row: Record<string, any> = payload.row;
      const property: string = payload.column.property;
      const value = row[property];
      this.editBeforeValue = value;

      const rowIndex: number = payload.rowIndex;
      const columnIndex: number = payload.columnIndex;
      const mapValue = this.findExist({ r: rowIndex, c: columnIndex });
      this.sourceCellValue = mapValue ? mapValue.o : value;
    },

    editClosed(payload: Record<string, any>) {
      // 用于撤销/恢复
      const row: Record<string, any> = payload.row;
      const property: string = payload.column.property;
      const value = row[property];
      if (value != this.editBeforeValue) {
        this.$emit('undo', { row, property, value, oldValue: this.editBeforeValue });
      }

      // 用于记录哪些单元格被修改了
      const rowIndex: number = payload.rowIndex;
      const columnIndex: number = payload.columnIndex;
      if (value != this.sourceCellValue) {
        this.editRecords.set(JSON.stringify({ r: rowIndex, c: columnIndex }), { o: this.sourceCellValue, n: value });
      } else {
        this.editRecords.delete(JSON.stringify({ r: rowIndex, c: columnIndex }));
      }
    },

    findExist(address: { r: number; c: number }) {
      return this.editRecords.get(JSON.stringify(address));
    },
  },
});
</script>
