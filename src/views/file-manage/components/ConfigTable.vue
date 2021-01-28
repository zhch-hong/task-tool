<template>
  <div>
    <AddConfig @add-config="addConfig" />
    <el-table :data="tableData" height="90vh">
      <el-table-column label="文件">
        <template #default="{ row, $index }">
          <TableInlineInput
            ref="InputFile"
            v-if="row.edit"
            v-model="editRow.file"
            @blur="inputBlur"
            @enter="inputEnter($index)"
          />
          <span v-else @click="editModel($index, 'InputFile')">{{
            row.file
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="起始ID">
        <template #default="{ row, $index }">
          <TableInlineInput
            ref="InputStart"
            v-if="row.edit"
            v-model="editRow.start"
            @blur="inputBlur"
            @enter="inputEnter($index)"
          />
          <span v-else @click="editModel($index, 'InputStart')">{{
            row.start
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="截至ID">
        <template #default="{ row, $index }">
          <TableInlineInput
            ref="InputEnd"
            v-if="row.edit"
            v-model="editRow.end"
            @blur="inputBlur"
            @enter="inputEnter($index)"
          />
          <span v-else @click="editModel($index, 'InputEnd')">{{
            row.end
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" prop="desc">
        <template #default="{ row, $index }">
          <TableInlineInput
            ref="InputDesc"
            v-if="row.edit"
            v-model="editRow.desc"
            @blur="inputBlur"
            @enter="inputEnter($index)"
          />
          <span v-else @click="editModel($index, 'InputDesc')">{{
            row.desc
          }}</span>
        </template>
      </el-table-column>
      <el-table-column>
        <template #default="{ $index }">
          <el-button
            size="mini"
            @click="deleteRow($index)"
            type="danger"
            icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';

import { readFileText, writeFileText } from '@/utils';

import AddConfig from './AddConfig.vue';
import TableInlineInput from './TableInlineInput.vue';

@Component({
  components: {
    AddConfig,
    TableInlineInput,
  },
})
export default class ConfigTable extends Vue {
  $refs: Record<string, any> = {
    InputFile: HTMLInputElement,
    InputStart: HTMLInputElement,
    InputEnd: HTMLInputElement,
    InputDesc: HTMLInputElement,
  };

  @Prop({ type: String, required: true }) configPath!: string;

  tableData: Record<string, any>[] = [];
  editRow: Record<string, any> = {
    file: '',
    start: '',
    end: '',
    edit: false,
  };

  created(): void {
    this.tableData = readFileText(this.configPath);
  }

  deleteRow(index: number): void {
    this.tableData.splice(index, 1);
    writeFileText(this.configPath, this.tableData);
  }

  async editModel(index: number, ref: string): Promise<void> {
    this.tableData.forEach((item) => {
      delete item.edit;
    });
    await this.$nextTick();
    Object.assign(this.editRow, this.tableData[index]);
    this.editRow.edit = true;
    this.tableData.splice(index, 1, cloneDeep(this.editRow));
    await this.$nextTick();
    this.$refs[ref].focus();
  }

  inputEnter(index: number): void {
    delete this.editRow.edit;
    this.tableData.splice(index, 1, cloneDeep(this.editRow));
    writeFileText(this.configPath, this.tableData);
  }

  inputBlur(): void {
    this.tableData = this.tableData.map((item) => {
      delete item.edit;
      return item;
    });
  }

  addConfig(row: Record<string, any>): void {
    this.tableData.push(cloneDeep(row));
    writeFileText(this.configPath, this.tableData);
  }
}
</script>
