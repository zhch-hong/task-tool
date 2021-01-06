<template>
  <div id="edit-task">
    <div style="margin-bottom: 10px">
      <el-button
        :loading="loading"
        @click="handleSave"
        title="Ctrl+S"
        type="primary"
        >保存任务</el-button
      >
      <el-button @click="$router.push('/edit-file')">返回</el-button>
    </div>
    <div style="flex: 1; overflow: auto">
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
      <div style="height: 80px"></div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';
import { cloneDeep } from 'lodash';
import { bind, unbind } from 'mousetrap';

import store from '@/store';
import { stringify } from '@/utils';
import { writeExcel } from './utils/writeExcel';
import { WorkbookMap } from '@/shims-cust';

import BaseData from './components/BaseData.vue';
import ProgressData from './components/ProgressData.vue';
import SourceData from './components/SourceData.vue';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { readLastFile } from '@/asserts/lastOpenFile';
import { ActiveFileModule } from '@/store/modules/active-file';

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

  loading = false;
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

  async created(): Promise<void> {
    await this.getUpdateTaskData();
    this.bindKeyboard();
  }

  beforeDestroy(): void {
    this.unBindKeyboard();
  }

  async getUpdateTaskData(): Promise<void> {
    const id = store.state.updateTaskId;
    if (id !== '') {
      const path = ActiveFileModule.path;

      if (!path) {
        readLastFile()
          .then(() => {
            this.getUpdateTaskData();
          })
          .catch();
        return;
      }

      const workbookMap = await WorkspacedModule.bookMapByPath(path);

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
    this.loading = true;
    await this.$nextTick();
    this.$refs.baseDataRef.submit();
    this.$refs.progressDataRef.submit();
    this.$refs.sourceDataRef.submit();
    await this.$nextTick();
    writeExcel(this.taskData);
    setTimeout(async () => {
      this.loading = false;
    }, 500);
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

  bindKeyboard(): void {
    bind(
      'ctrl+s',
      () => {
        this.handleSave();
        return false;
      },
      'keydown'
    );
  }

  unBindKeyboard(): void {
    unbind('ctrl+s', 'keydown');
  }
}
</script>
<style lang="scss">
#edit-task {
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
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
