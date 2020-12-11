<template>
  <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in activities"
      :key="activity.uuid"
    >
      <LineItem
        :progress-item="activity"
        :reward-type="rewardType"
        @insert-progress="insertProgress(index)"
        @delete-progress="deleteProgress(index)"
        @process-change="updateProcess(index, $event)"
      />
    </el-timeline-item>
    <el-button v-if="activities.length === 0" @click="insertProgress(0)"
      >添加进度</el-button
    >
  </el-timeline>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { v4 as uuid } from 'uuid';

import LineItem from './LineItem.vue';

@Component({
  components: {
    LineItem,
  },
})
export default class ProgressLine extends Vue {
  @Prop() process!: string[] | null;
  @Prop() awards!: Record<string, string>[][];
  @Prop() rewardType!: 'nor' | 'random';

  activities: Record<string, any>[] = [];

  @Watch('process', { deep: true, immediate: true })
  processWatch(process: string[] | null): void {
    if (!process) return;

    const array: Record<string, any>[] = [];
    process.forEach((p, i) => {
      array.push({
        uuid: uuid(),
        process: p,
        rewardType: this.rewardType,
        awards: this.awards[i] || [],
      });
    });

    this.activities = array;
  }

  insertProgress(index: number): void {
    this.activities.splice(index + 1, 0, {
      uuid: uuid(),
      process: '',
      rewardType: this.rewardType,
      awards: [],
    });
  }

  deleteProgress(index: number): void {
    this.activities.splice(index, 1);
  }

  updateProcess(index: number, value: string): void {
    this.activities[index].process = value;
  }

  submit(): Record<string, any>[] {
    return this.activities;
  }
}
</script>
