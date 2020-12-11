<template>
  <div>
    <input type="text" v-model="progressValue" placeholder="请输入进度" />
    <el-card>
      <RewardTable :reward-list="rewardList" :reward-type="rewardType" />
    </el-card>
    <el-button
      size="mini"
      style="margin-top: 10px"
      @click="$emit('insert-progress')"
      >插入进度</el-button
    >
    <el-button
      size="mini"
      style="margin-top: 10px"
      @click="$emit('delete-progress')"
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
  @Prop() progressItem!: Record<string, string | Record<string, string>[]>;
  @Prop() rewardType!: 'nor' | 'random';

  progressValue = this.progressItem.process;
  rewardList = this.progressItem.awards;

  @Watch('progressValue')
  processWatch(value: string): void {
    this.$emit('process-change', value);
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
