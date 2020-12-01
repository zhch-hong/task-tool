<template>
  <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in activities"
      :key="activity.uuid"
    >
      <LineItem
        :progress-item="activity"
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

import LineItem from './LineItem.vue';

function getLostIdArray(): () => number {
  const wb = store.state.workbook;
  if (!wb) {
    throw new Error('vuex中不存在workbook');
  }

  const rewardSheet = wb.getWorksheet('award_data');
  const lostIdArray: number[] = [];
  rewardSheet.eachRow((row, index) => {
    if (index === 1) {
      const rowValues = row.values;
      if (Array.isArray(rowValues)) {
        const index = rowValues.findIndex((v) => {
          if (typeof v === 'string') {
            return v.split('|')[0] === 'award_id';
          }
        });
        if (index !== -1) {
          const awardIdColumn = rewardSheet.getColumn(index);
          const cellValues = awardIdColumn.values;
          const values = cellValues.filter((cell) => {
            return typeof cell === 'number';
          });
          const unrepeatSortedIdArray = [
            ...new Set<number>(values as number[]),
          ].sort((a, b) => a - b);
          unrepeatSortedIdArray.push(3000);
          let length = lostIdArray.length;
          unrepeatSortedIdArray.forEach((v, i) => {
            length = lostIdArray.length;
            while (v - (i + length) > 1) {
              length = lostIdArray.push(i + length + 1);
            }
          });
        }
      }
    }
  });

  let index = 0;
  return () => {
    return lostIdArray[index++];
  };
}

const lostId = getLostIdArray();

@Component({
  components: {
    LineItem,
  },
})
export default class ProgressLine extends Vue {
  @Prop({ type: Object, required: true }) progress!: Record<string, any> | null;

  activities: Record<string, any>[] = [];

  @Watch('progress', { immediate: true })
  progressChange(progress: Record<string, any>): void {
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
      awardId: lostId(),
      process: '',
      rewardType: this.progress ? this.progress.rewardType : 'normal',
      awards: [],
    });
    console.log(this.activities);
  }

  deleteProgress(index: number): void {
    this.activities.splice(index, 1);
  }

  updateProcess(index: number, value: string): void {
    console.log(index, value);
    this.activities[index].process = value;
  }

  submit(): Record<string, any>[] {
    return this.activities;
  }
}
</script>
