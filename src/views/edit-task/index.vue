<template>
  <div>
    <BaseData ref="baseData" @submit="baseData" />
    <ProgressData ref="progressData" @submit="progressData" />
    <SourceData
      ref="sourceData"
      :lost-sourceid="lostSourceidArray()"
      @submit="sourceData"
    />
    <el-button :loading="loading" @click="handleSave" style="margin-top: 20px"
      >保存</el-button
    >
  </div>
</template>
<script lang="ts">
import store from '@/store';
import { Component, Vue } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';

import { writeExcel } from './utils/writeExcel';

import BaseData from './components/BaseData.vue';
import ProgressData from './components/ProgressData.vue';
import SourceData from './components/SourceData.vue';

/**
 * 每一条任务的来源id，一个任务id可能对应多条来源数据，并且这些来源的source_id都是相同的，只是source_type不同
 * 这里算出从1开始，连续顺序中，缺失的数字，组成数组
 * 每调用一次方法，返回数组中首个数字作为source_id
 */
function getLostSourceidArray(): () => number {
  const wb = store.state.workbook;
  if (!wb) {
    throw new Error('vuex中不存在workbook');
  }

  const rewardSheet = wb.getWorksheet('source');
  const lostIdArray: number[] = [];
  rewardSheet.eachRow((row, index) => {
    if (index === 1) {
      const rowValues = row.values;
      if (Array.isArray(rowValues)) {
        const index = rowValues.findIndex((v) => {
          if (typeof v === 'string') {
            return v.split('|')[0] === 'source_id';
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

  return () => {
    return lostIdArray.shift() as number;
  };
}

@Component({
  components: {
    BaseData,
    ProgressData,
    SourceData,
  },
  beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext): void {
    store.commit('updateTaskId', '');
    next();
  },
})
export default class EditTask extends Vue {
  $refs!: {
    baseData: any;
    progressData: any;
    sourceData: any;
  };

  lostSourceidArray = getLostSourceidArray();
  loading = false;
  taskData: Record<string, any> = {};

  async handleSave(): Promise<void> {
    this.loading = true;
    await this.$nextTick();
    this.$refs.baseData.submit();
    this.$refs.progressData.submit();
    this.$refs.sourceData.submit();
    await this.$nextTick();
    writeExcel(this.taskData);
    await this.$nextTick();
    this.loading = false;
    this.$notify({
      title: '提示',
      message: '保存成功',
      type: 'success',
      position: 'bottom-right',
    });
  }

  baseData(object: Record<string, any>): void {
    this.taskData.base = object;
  }

  progressData(object: Record<string, any>): void {
    this.taskData.progress = object;
  }

  sourceData(object: Record<string, any>[]): void {
    this.taskData.source = object;
  }
}
</script>
