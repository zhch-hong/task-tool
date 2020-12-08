<template>
  <fieldset>
    <legend>进度配置</legend>
    <el-form label-width="100px">
      <el-form-item label="奖励方式">
        <el-radio v-model="rewardType" label="nor">普通</el-radio>
        <el-radio v-model="rewardType" label="random">随机</el-radio>
      </el-form-item>
      <el-form-item label="循环最后阶段">
        <el-switch v-model="lastLoop"> </el-switch>
      </el-form-item>
      <el-form-item label="初始进度">
        <el-input v-model.trim="preProcess"> </el-input>
      </el-form-item>
    </el-form>
    <ProgressLine
      ref="progressLine"
      :progress="progress"
      :reward-type="rewardType"
    />
  </fieldset>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

import store from '@/store';
import { sheetToJson } from '@/utils/sheetToJson';

import ProgressLine from './progress-data/ProgressLine.vue';

function getProgress(): Record<string, any> | undefined {
  const wb = store.state.workbook;
  if (!wb) return;
  const wsTask = wb.getWorksheet('task');
  const taskid = store.state.updateTaskId;
  const task = sheetToJson(wsTask).find(
    (v) => v.id.toString() === taskid.toString()
  );
  if (task) {
    const wsProcess = wb.getWorksheet('process_data');
    const process = sheetToJson(wsProcess).find((v) => {
      if (typeof v.process_id === 'undefined') return false;
      return v.process_id.toString() === task.process_id.toString();
    });
    if (process) {
      const rewardIdList = process.awards.split(',');
      const rewardSheet = wb.getWorksheet('award_data');
      if (rewardSheet) {
        const rewardJson = sheetToJson(rewardSheet).filter((item) =>
          rewardIdList.includes(item.award_id.toString())
        );
        const processList = process.process.split(',');
        const lastProcess = processList.pop();
        return {
          rewardJson,
          rewardType: process.get_award_type || 'nor',
          lastLoop: process.process.split(',').pop() === '-1',
          preProcess: process.pre_add_process || '',
          process:
            lastProcess === '-1' ? processList.join(',') : process.process,
          awards: process.awards,
        };
      }
    }
  }
}

@Component({
  components: {
    ProgressLine,
  },
})
export default class ProgressData extends Vue {
  $refs!: {
    progressLine: any;
  };

  lastLoop = false;
  rewardType = 'nor';
  preProcess = '';
  progress: Record<string, any> | null = null;

  created(): void {
    const progress = getProgress();
    if (progress) {
      const { rewardType, lastLoop, preProcess } = progress;
      this.lastLoop = lastLoop as boolean;
      this.rewardType = rewardType as string;
      this.preProcess = preProcess as string;
      this.progress = progress;
    }
  }

  submit(): void {
    const lineData: Record<string, any>[] = this.$refs.progressLine.submit();
    const obj = {
      lastLoop: this.lastLoop,
      rewardType: this.rewardType,
      preProcess: this.preProcess,
      lineData,
    };
    this.$emit('submit', obj);
  }
}
</script>
