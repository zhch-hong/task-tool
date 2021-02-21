<template>
  <div style="position: relative">
    <div class="search">
      <el-input v-model="searchKey" size="small" @input="find" clearable>
        <template #suffix>
          <i class="suffix el-icon-top" title="上一个" @click="findPrev"></i>
          <i class="suffix el-icon-bottom" title="下一个" @click="findNext"></i>
        </template>
      </el-input>
    </div>
    <vxe-table
      ref="xTable"
      border
      keep-source
      show-overflow="title"
      show-header-overflow="title"
      :height="tableHeight"
      :data="tableData"
      :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true, icon: 'none' }"
      :mouse-config="{ selected: true }"
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
      >
        <template #edit="scope">
          <el-input size="mini" v-model="scope.row[col.field]" @input="$refs.xTable.updateStatus(scope)"></el-input>
        </template>
      </vxe-table-column>
    </vxe-table>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import { cloneDeep } from 'lodash';
import { RowInfo, Table } from 'vxe-table';
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
      searchKey: '',
      findIndex: 0,
      findResult: [] as Array<Record<string, any>>,
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
      console.log(row);

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

    find() {
      if (!this.searchKey) {
        this.findResult = [];
        return;
      }

      const { fullData } = (this.$refs.xTable as Table).getTableData();
      const findResult: Array<Record<string, any>> = [];
      fullData.forEach((rowInfo) => {
        for (const key in rowInfo) {
          if (Object.prototype.hasOwnProperty.call(rowInfo, key)) {
            const element: string = rowInfo[key];
            if (element && element.toString().includes(this.searchKey)) {
              findResult.push({ row: rowInfo, field: key });
            }
          }
        }
      });
      this.findResult = findResult;
    },

    findPrev() {
      const prev = this.findIndex--;
      const index = prev % this.findResult.length;
      const info = this.findResult[index];
      if (info) {
        (this.$refs.xTable as Table).setSelectCell(info.row, info.field);
      }
      // this.findIndex--;
    },

    findNext() {
      const next = this.findIndex++;
      const index = next % this.findResult.length;
      const info = this.findResult[index];
      if (info) {
        (this.$refs.xTable as Table).setSelectCell(info.row, info.field);
      }
      // this.findIndex++;
    },
  },
});
</script>
<style lang="scss" scoped>
div.search {
  position: absolute;
  top: 32px;
  right: 0;
  z-index: 4;
  i.suffix {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    margin: 0 2px;
    cursor: pointer;
    font-size: 16px;
    padding: 6px 0;
    &:hover {
      background-color: #f2f2f2;
    }
  }
}
</style>
