<template>
  <div>
    <fieldset>
      <legend>奖励配置</legend>
      <el-radio v-model="rewardType" label="normal">普通</el-radio>
      <el-radio v-model="rewardType" label="random">随机</el-radio>
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
        <el-table-column
          label="广播"
          prop="broadcast_content"
          :formatter="booleanFormat"
        ></el-table-column>
        <el-table-column
          label="邮件"
          prop="is_send_email"
          :formatter="booleanFormat"
        ></el-table-column>
        <el-table-column>
          <template #default="{ $index }">
            <el-button size="mini" @click="updateRow($index)">修改</el-button>
            <el-button size="mini" @click="deleteRow($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button @click="appendRow">新增</el-button>
    </fieldset>
    <!-- Components -->
    <UpdateReward
      :visible="updateReward"
      :propRow="selectedRow"
      :rewardType="rewardType"
      @update:visible="updateReward = false"
      @submit="updateRowSubmit"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import UpdateReward from './reward-data/UpdateReward.vue';

@Component({
  components: {
    UpdateReward,
  },
})
export default class RewardData extends Vue {
  /** 奖励方式 */
  rewardType = 'normal';
  updateReward = false;
  selectedRow: null | Record<string, any> = null;
  selectedIndex = -1;
  tableData: Record<string, any>[] = [];

  appendRow(): void {
    this.selectedRow = null;
    this.selectedIndex = -1;
    this.updateReward = true;
  }

  updateRow(index: number): void {
    this.selectedRow = this.tableData[index];
    this.selectedIndex = index;
    this.updateReward = true;
  }

  deleteRow(index: number): void {
    this.tableData.splice(index, 1);
  }

  updateRowSubmit(row: Record<string, any>): void {
    if (this.selectedRow === null) {
      this.tableData.push(row);
    } else {
      this.tableData.splice(this.selectedIndex, 1, row);
    }
  }

  assetTypeFormat(
    row: Record<string, any>,
    column: Record<string, any>,
    value: string
  ): string {
    if (value === 'prop_web_chip_huafei') return '福卡';
    if (value === 'jing_bi') return '金币';
    if (value === 'shop_gold_sum') return '鱼币';
    return value;
  }

  booleanFormat(
    row: Record<string, any>,
    column: Record<string, any>,
    value: boolean
  ): string {
    return value ? '是' : '否';
  }
}
</script>
