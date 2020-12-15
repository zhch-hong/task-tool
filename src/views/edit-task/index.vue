<template>
  <div>
    <BaseData
      ref="baseDataRef"
      :base-data="baseData"
      @submit="baseDataSubmit"
      @template-uuid="baseTempid"
    />
    <ProgressData
      ref="progressDataRef"
      :process-data="processData"
      :award-data="awardData"
      @submit="progressDataSubmit"
    />
    <SourceData
      ref="sourceDataRef"
      :source-data="sourceData"
      :condition-data="conditionData"
      @submit="sourceDataSubmit"
    />
    <el-button @click="handleSave" style="margin-top: 20px">保存</el-button>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';
import { cloneDeep } from 'lodash';

import store from '@/store';
import { writeExcel } from './utils/writeExcel';
import { WorkbookMap } from '@/shims-vue';

import BaseData from './components/BaseData.vue';
import ProgressData from './components/ProgressData.vue';
import SourceData from './components/SourceData.vue';
import { stringify } from '@/utils';

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
    baseDataRef: any;
    progressDataRef: any;
    sourceDataRef: any;
  };

  baseData: Record<string, string> | null = {};
  processData: Record<string, string> | null = null;
  awardData: Record<string, string>[][] = [];
  sourceData: Record<string, string>[] = [];
  conditionData: Record<string, string>[][] = [];

  taskData: Record<string, any> = {};

  created(): void {
    this.getUpdateTaskData();
  }

  getUpdateTaskData(): void {
    const id = store.state.updateTaskId;
    if (id !== '') {
      const workbookMap: WorkbookMap = store.getters.workbookMap();

      const taskList = workbookMap.get('task') as Record<string, string>[];
      const taskJson = taskList.find(
        (item) => item.id.toString() === id.toString()
      ) as Record<string, string>;
      this.baseData = taskJson;

      const { process_id } = taskJson;
      const processList = workbookMap.get('process_data') as Record<
        string,
        string
      >[];
      const processJson = processList.find(
        (item) => item.process_id === process_id
      ) as Record<string, string>;
      this.processData = processJson;

      const { source_id, awards } = processJson;

      const awardList = workbookMap.get('award_data') as Record<
        string,
        string
      >[];
      this.awardData = awards.split(',').map((award_id) => {
        return awardList.filter((award) => award.award_id === award_id);
      });

      const sourceList = workbookMap.get('source') as Record<string, string>[];
      this.sourceData = sourceList.filter(
        (source) => source.source_id === source_id
      );

      const conditionList = workbookMap.get('condition') as Record<
        string,
        string
      >[];
      this.conditionData = this.sourceData.map(
        (source: Record<string, string>) => {
          return conditionList.filter(
            (condition) => condition.condition_id === source.condition_id
          );
        }
      );

      console.log(stringify(this.baseData));
      console.log(stringify(this.processData));
      console.log(stringify(this.sourceData));
      console.log(stringify(this.conditionData));
      console.log(stringify(this.awardData));
    }
  }

  async handleSave(): Promise<void> {
    this.$refs.baseDataRef.submit();
    this.$refs.progressDataRef.submit();
    this.$refs.sourceDataRef.submit();
    await this.$nextTick();
    writeExcel(this.taskData);
    this.$notify({
      title: '提示',
      message: '保存成功',
      type: 'success',
      position: 'bottom-right',
    });
    setTimeout(() => {
      this.$router.push('/edit-file');
    }, 2000);
  }

  baseDataSubmit(object: Record<string, any>): void {
    this.taskData.base = cloneDeep(object);
  }

  baseTempid(uuid: string): void {
    console.log('base uuid', uuid);
  }

  progressDataSubmit(object: Record<string, any>): void {
    this.taskData.process = cloneDeep(object);
  }

  processTempid(uuid: string): void {
    console.log('process uuid', uuid);
  }

  sourceDataSubmit(object: Record<string, any>[]): void {
    this.taskData.source = cloneDeep(object);
  }

  sourceTempid(uuid: string): void {
    console.log('source uuid', uuid);
  }
}
</script>
