<template>
  <div>
    <el-select v-model="selectValue" @change="selectChange">
      <el-option
        v-for="op in selectList"
        :key="op.value"
        :label="op.label"
        :value="op.value"
      ></el-option>
    </el-select>

    <el-table :data="tableData">
      <el-table-column label="名称" prop="value"></el-table-column>
      <el-table-column label="说明" prop="name"></el-table-column>
      <el-table-column>
        <template #default="{ $index }">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteRow($index)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!--  -->
    <CreateConfig
      :visible="createConfig"
      @update:visible="(v) => (createConfig = v)"
      @submit="appendRow"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { resolve } from 'path';

import { readFile, writeFile } from '@/utils/fileStream';
import { getUserconfig } from '@/asserts/userconfig';

import CreateConfig from './components/CreateConfig.vue';

const filePath = resolve(
  getUserconfig().workDir,
  'app_config',
  'input-manage.json'
);

interface Config {
  value: string;
  name: string;
  select: Array<ConfigSelect>;
}

interface ConfigSelect {
  value: string;
  name: string;
}

@Component({
  components: {
    CreateConfig,
  },
})
export default class InputManage extends Vue {
  selectValue = '';
  sourceData: Array<Config> = [];
  selectList: Array<Record<string, string>> = [];
  tableData: Array<ConfigSelect> = [];
  createConfig = false;

  created(): void {
    this.sourceData = readFile(filePath);
    this.parseSelect();
  }

  parseSelect(): void {
    this.selectList = this.sourceData.map((item) => {
      return {
        label: item.name,
        value: item.value,
      };
    });
  }

  selectChange(value: string): void {
    const config = this.sourceData.find((item) => item.value === value);
    if (config) {
      this.tableData = config.select;
    }
  }

  appendRow(row: ConfigSelect): void {
    this.tableData.push(row);
    this.writeFile();
  }

  async deleteRow(index: number): Promise<void> {
    try {
      await this.$confirm('确定删除该条配置吗？');
    } catch (error) {
      return;
    }
    this.tableData.splice(index, 1);
    this.writeFile();
  }

  writeFile(): void {
    writeFile(filePath, this.sourceData);
  }
}
</script>
