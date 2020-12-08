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
import { Notification } from 'element-ui';

import store from '@/store';
import { sheetToJson } from '@/utils/sheetToJson';

import UpdateReward from './UpdateReward.vue';

@Component({
  components: {
    UpdateReward,
  },
})
export default class RewardTable extends Vue {
  @Prop({ type: Array, required: true }) rewardList!: Record<string, string>[];
  @Prop({ type: String, required: true }) rewardType!: 'normal' | 'random';
  @Prop({ type: Number, required: true }) awardId!: number;

  updateReward = false;
  selectedRow: null | Record<string, any> = null;
  selectedIndex = -1;
  tableData: Record<string, string>[] = [];
  useAwardId = this.awardId.toString();

  created(): void {
    this.tableData = this.rewardList;

    if (this.tableData.length > 0) {
      this.useAwardId = this.tableData[0].award_id;
    }
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

  updateOrInsertRow(row: Record<string, any>): void {
    if (this.selectedRow === null) {
      row['award_id'] = this.useAwardId;
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
    if (value === 'prop_web_chip_huafei') return '福卡';
    if (value === 'jing_bi') return '金币';
    if (value === 'shop_gold_sum') return '鱼币';
    return value;
  }
}
</script>
