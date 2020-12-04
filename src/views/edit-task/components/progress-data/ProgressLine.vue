<template>
  <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in activities"
      :key="activity.uuid"
    >
      <LineItem
        :progress-item="activity"
        :award-id="propAwardid(activity)"
        @insert-progress="insertProgress(index)"
        @delete-progress="deleteProgress(index)"
        @process-change="updateProcess(index, $event)"
      />
    </el-timeline-item>
  </el-timeline>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { v4 as uuid } from 'uuid';

import store from '@/store';
import { lostIdArray } from '../../utils/lostIdArray';

import LineItem from './LineItem.vue';

@Component({
  components: {
    LineItem,
  },
})
export default class ProgressLine extends Vue {
  @Prop({ required: true }) progress!: Record<string, any> | null;

  activities: Record<string, any>[] = [];
  lostIdArray = lostIdArray('award_data', 'award_id');

  @Watch('progress', { deep: true, immediate: true })
  progressChange(progress: Record<string, any> | null): void {
    if (!progress) return;
    const { process, awards, rewardJson, rewardType } = progress;
    const array: Record<string, any>[] = [];
    const processSplit: string[] = process.split(',');
    const awardsSplit: string[] = awards.split(',');
    processSplit.forEach((p, i) => {
      array.push({
        uuid: uuid(),
        awardId: awardsSplit[i],
        process: p,
        rewardType: rewardType,
        awards: rewardJson.filter(
          (v: Record<string, string>) => v.award_id === awardsSplit[i]
        ),
      });
    });
    this.activities = array;
  }

  insertProgress(index: number): void {
    this.activities.splice(index + 1, 0, {
      uuid: uuid(),
      process: '',
      rewardType: this.progress ? this.progress.rewardType : 'normal',
      awards: [],
    });
  }

  propAwardid(item: Record<string, any>): number {
    if (item.awards.length > 0) return parseInt(item.awards[0].award_id);
    return this.lostIdArray();
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
