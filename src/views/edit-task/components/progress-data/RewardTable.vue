<template>
  <div>
    <el-table :data="tableData">
      <el-table-column label="奖励名称" prop="award_name"></el-table-column>
      <el-table-column
        label="财富类型"
        prop="asset_type"
        :formatter="assetTypeFormat"
      ></el-table-column>
      <el-table-column label="数量" prop="asset_count"></el-table-column>
      <el-table-column
        v-if="rewardType === 'random'"
        label="权重"
        prop="get_weight"
      ></el-table-column>
      <el-table-column label="广播" prop="broadcast_content"></el-table-column>
      <el-table-column label="邮件" prop="is_send_email"></el-table-column>
      <el-table-column>
        <template #default="{ $index }">
          <el-button size="mini" @click="clickUpdate($index)">修改</el-button>
          <el-button size="mini" @click="deleteRow($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button @click="appendRow" style="margin-top: 10px">添加奖励</el-button>
    <!-- Components -->
    <UpdateReward
      :visible="updateReward"
      :prop-row="selectedRow"
      :reward-type="rewardType"
      @update:visible="updateReward = false"
      @submit="updateOrInsertRow"
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { resolve } from 'path';
import { readFileText } from '@/utils';

import UpdateReward from './UpdateReward.vue';
import { configDir } from '@/asserts/dir-config';

const path = resolve(configDir, 'app_config', 'input-manage.json');

const inputList: Record<string, any>[] = readFileText(path);
const assetData = inputList.find((item) => item.value === 'asset');
let assetList: Record<string, string>[] = [];
if (assetData) {
  assetList = assetData.select;
}

@Component({
  components: {
    UpdateReward,
  },
})
export default class RewardTable extends Vue {
  @Prop() rewardList!: Record<string, string>[];
  @Prop() rewardType!: 'nor' | 'random';

  updateReward = false;
  selectedRow: null | Record<string, string> = null;
  selectedIndex = -1;
  tableData: Record<string, string>[] = [];

  created(): void {
    this.tableData = this.rewardList;
  }

  appendRow(): void {
    this.selectedRow = null;
    this.selectedIndex = -1;
    this.updateReward = true;
  }

  clickUpdate(index: number): void {
    this.selectedRow = this.tableData[index];
    this.selectedIndex = index;
    this.updateReward = true;
  }

  updateOrInsertRow(row: Record<string, string>): void {
    if (this.selectedRow === null) {
      this.tableData.push(row);
    } else {
      this.tableData.splice(this.selectedIndex, 1, row);
    }
  }

  deleteRow(index: number): void {
    this.tableData.splice(index, 1);
  }

  assetTypeFormat(
    row: Record<string, any>,
    column: Record<string, any>,
    value: string
  ): string {
    const res = assetList.find((item) => item.value === value);
    if (res) return res.name;
    return value;
  }
}
</script>
