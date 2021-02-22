<template>
  <div style="position: relative">
    <transition name="fade">
      <div v-if="showSearch" class="search">
        <input v-model="searchKey" ref="SearchInput" class="mousetrap" type="text" @input="find" />
        <div class="suffix-slot">
          <span class="find-count">{{ currentPointer }}/{{ findResult.length }}</span>
          <i class="suffix el-icon-top" style="margin-right: 4px" title="上一个（Shif+F3）" @click="findPrev"></i>
          <i class="suffix el-icon-bottom" title="下一个（F3）" @click="findNext"></i>
        </div>
      </div>
    </transition>
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
import { Table } from 'vxe-table';
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
      showSearch: false,
      findIndex: null as number | null,
      findResult: [] as Array<Record<string, any>>,
      editRecords: new Map<string, Record<'o' | 'n', any>>(),
      sourceCellValue: '',
    };
  },

  computed: {
    tableHeight(): string {
      return ViewResizeModule.windowHeight - 71 + 'px';
    },

    currentPointer(): number {
      if (this.findIndex === null) {
        return 0;
      } else {
        return this.findIndex + 1;
      }
    },
  },

  watch: {
    showSearch: {
      handler(value: boolean) {
        if (!value) {
          this.findResult = [];
          this.findIndex = null;
          this.searchKey = '';
          (this.$refs.xTable as Table).clearSelected();
        } else {
          this.$nextTick(() => {
            setTimeout(() => {
              (this.$refs.SearchInput as HTMLInputElement).focus();
            }, 800);
          });
        }
      },
    },
  },

  mounted() {
    setTimeout(() => {
      this.tableData = cloneDeep(this.data);
    }, 500);
  },

  methods: {
    getUpdateRecords(): Map<string, Record<'o' | 'n', any>> {
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

      // 修改单元格的值后，重置查找
      this.find();
    },

    findExist(address: { r: number; c: number }) {
      return this.editRecords.get(JSON.stringify(address));
    },

    find() {
      this.findIndex = null;

      if (!this.searchKey) {
        this.findResult = [];
        (this.$refs.xTable as Table).clearSelected();
        return;
      }

      const { fullData } = (this.$refs.xTable as Table).getTableData();
      const findResult: Array<Record<string, any>> = [];
      fullData.forEach((rowInfo) => {
        for (const key in rowInfo) {
          if (Object.prototype.hasOwnProperty.call(rowInfo, key)) {
            const element: string = rowInfo[key];
            if (element && element.toString().includes(this.searchKey) && key !== '_XID') {
              findResult.push({ row: rowInfo, field: key });
            }
          }
        }
      });
      this.findResult = findResult;

      // 搜索完成后默认选中第一个
      if (this.findResult.length !== 0) {
        this.findIndex = 0;
        const info = this.findResult[this.findIndex];

        if (info) {
          (this.$refs.xTable as Table).scrollToRow(info.row, info.field).then(() => {
            (this.$refs.xTable as Table).scrollToColumn(info.field).then(() => {
              (this.$refs.xTable as Table).setSelectCell(info.row, info.field);
            });
          });
        }
      }
    },

    findPrev() {
      if (this.findIndex === null) return;

      this.findIndex--;

      if (this.findIndex < 0) {
        this.findIndex = this.findResult.length - 1;
      }

      const info = this.findResult[this.findIndex];

      if (info) {
        (this.$refs.xTable as Table).scrollToRow(info.row, info.field).then(() => {
          (this.$refs.xTable as Table).scrollToColumn(info.field).then(() => {
            (this.$refs.xTable as Table).setSelectCell(info.row, info.field);
          });
        });
      }
    },

    findNext() {
      if (this.findIndex === null) return;

      this.findIndex++;

      if (this.findIndex > this.findResult.length - 1) {
        this.findIndex = 0;
      }

      const info = this.findResult[this.findIndex];

      if (info) {
        (this.$refs.xTable as Table).scrollToRow(info.row, info.field).then(() => {
          (this.$refs.xTable as Table).scrollToColumn(info.field).then(() => {
            (this.$refs.xTable as Table).setSelectCell(info.row, info.field);
          });
        });
      }
    },
  },
});
</script>
<style lang="scss" scoped>
div.search {
  position: absolute;
  top: 30px;
  right: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  background-color: #eaeaeb;
  padding: 0 10px;
  box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.16);
  input.mousetrap {
    border: none;
    outline: none;
  }
  div.suffix-slot {
    height: 100%;

    i.suffix {
      cursor: pointer;
      font-size: 16px;
      padding: 6px 0;
      &:hover {
        background-color: #f2f2f2;
      }
    }

    span.find-count {
      user-select: none;
      margin: 0 6px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 500ms, transform, 500ms;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(100%);
}
</style>
