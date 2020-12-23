<template>
  <div id="edit-task">
    <BaseData
      ref="baseDataRef"
      :base-data="baseData"
      :template="propTemplate.base"
      @submit="baseDataSubmit"
      @template-uuid="setBaseTempid"
    />
    <ProgressData
      ref="progressDataRef"
      :process-data="processData"
      :award-data="awardData"
      :template="propTemplate.process"
      @submit="progressDataSubmit"
      @template-uuid="setProcessTempid"
    />
    <SourceData
      ref="sourceDataRef"
      :source-data="sourceData"
      :condition-data="conditionData"
      :template="propTemplate.source"
      @submit="sourceDataSubmit"
      @template-uuid="setSourceTempid"
    />
    <div style="text-align: right">
      <el-button
        type="primary"
        @click="handleSave"
        style="margin: 0 10px 20px 0"
        >保存任务</el-button
      >
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';
import { cloneDeep } from 'lodash';

import store from '@/store';
import { stringify } from '@/utils';
import { writeExcel } from './utils/writeExcel';
import { WorkbookMap } from '@/shims-cust';

import BaseData from './components/BaseData.vue';
import ProgressData from './components/ProgressData.vue';
import SourceData from './components/SourceData.vue';

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

  propTemplate = {
    base: '',
    process: '',
    source: '',
  };

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

      this.setPropTemplate(taskJson);

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

  setPropTemplate(data: Record<string, string>): void {
    const { base_temp, process_temp, source_temp } = data;
    if (base_temp) this.propTemplate.base = base_temp;
    if (process_temp) this.propTemplate.process = process_temp;
    if (source_temp) this.propTemplate.source = source_temp;
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

  progressDataSubmit(object: Record<string, any>): void {
    this.taskData.process = cloneDeep(object);
  }

  sourceDataSubmit(object: Record<string, any>[]): void {
    this.taskData.source = cloneDeep(object);
  }

  setBaseTempid(uuid: string): void {
    this.taskData.baseTempid = uuid;
  }

  setProcessTempid(uuid: string): void {
    this.taskData.processTempid = uuid;
  }

  setSourceTempid(uuid: string): void {
    this.taskData.sourceTempid = uuid;
  }
}
</script>
<style lang="scss">
#edit-task {
  fieldset {
    border-radius: 4px;
    margin: 20px 10px;
    margin-top: 0;
    border-color: #f2f2f2;
    legend {
      padding: 0 6px;
      margin-left: 5px;
      font-size: 17px;
      font-weight: 600;
      color: #404040;
    }
  }
}
</style>
