<template>
  <div>
    <input type="text" v-model="progressValue" placeholder="请输入进度" />
    <el-card>
      <RewardTable
        :reward-list="rewardList"
        :award-id="awardId"
        :rewardType="rewardType"
      />
    </el-card>
    <el-button size="mini" style="margin-top: 10px" @click="insertProgress"
      >插入进度</el-button
    >
    <el-button size="mini" style="margin-top: 10px" @click="deleteProgress"
      >删除进度</el-button
    >
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import RewardTable from './RewardTable.vue';

@Component({
  components: {
    RewardTable,
  },
})
export default class LineItem extends Vue {
  @Prop({ type: Object, required: true }) progressItem!: Record<
    string,
    string | Record<string, string>[]
  >;
  @Prop({ type: Number, required: true }) awardId!: number;

  progressValue = this.progressItem.process;
  rewardList = this.progressItem.awards;
  rewardType = this.progressItem.rewardType;

  @Watch('progressValue')
  progressValueChange(value: string): void {
    this.$emit('process-change', value);
  }

  insertProgress(): void {
    this.$emit('insert-progress');
  }

  deleteProgress(): void {
    this.$emit('delete-progress');
  }
}
</script>
<style lang="scss" scoped>
input {
  border: none;
  outline: none;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 600;
  width: 120px;
  box-sizing: border-box;
  border-bottom: 1px solid transparent;
  &:focus {
    border-bottom-color: #e4e7ed;
  }
  &::placeholder {
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
