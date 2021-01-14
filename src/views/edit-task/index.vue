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
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { NavigationGuardNext, Route } from 'vue-router';
import { cloneDeep } from 'lodash';
import { bind, unbind } from 'mousetrap';
import { remote } from 'electron';

import store from '@/store';
import { writeExcel } from './utils/writeExcel';
import { stringify } from '@/utils';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { readLastFile } from '@/asserts/lastOpenFile';
import { ActiveFileModule } from '@/store/modules/active-file';

import BaseData from './components/BaseData.vue';
import ProgressData from './components/ProgressData.vue';
import SourceData from './components/SourceData.vue';

export default Vue.extend({
  name: 'edit-task',

  components: {
    BaseData,
    ProgressData,
    SourceData,
  },

  data() {
    return {
      loading: false,
      baseData: {} as Record<string, string> | null,
      processData: null as Record<string, string> | null,
      awardData: [] as Record<string, string>[][],
      sourceData: [] as Record<string, string>[],
      conditionData: [] as Record<string, string>[][],

      taskData: {} as Record<string, any>,

      /** 没有任何修改，没有被污染过的数据 */
      nocontaminated: {} as Record<string, any>,

      propTemplate: {
        base: '',
        process: '',
        source: '',
      },
    };
  },
  async created(): Promise<void> {
    await this.getUpdateTaskData();
    this.bindKeyboard();
    this.getNocontaminated();
  },

  async beforeRouteLeave(
    to: Route,
    from: Route,
    next: NavigationGuardNext
  ): Promise<void> {
    (this.$refs.baseDataRef as any).submit();
    (this.$refs.progressDataRef as any).submit();
    (this.$refs.sourceDataRef as any).submit();
    await this.$nextTick();

    const oldData = JSON.stringify(this.nocontaminated);
    const newData = JSON.stringify(this.taskData);

    if (!(oldData.startsWith(newData) && oldData.endsWith(newData))) {
      const { dialog } = remote;
      const response = dialog.showMessageBoxSync({
        title: '数据变动',
        message: '检测到数据已经改动，并尚未保存，离开将丢弃数据',
        type: 'warning',
        cancelId: -1,
        buttons: ['取消', '放弃改动'],
      });
      if (response === 1) {
        store.commit('updateTaskId', '');
        next();
      } else {
        next(false);
      }
    } else {
      store.commit('updateTaskId', '');
      next();
    }
  },

  beforeDestroy(): void {
    this.unBindKeyboard();
  },

  methods: {
    getNocontaminated(): void {
      (this.$refs.baseDataRef as any).submit();
      (this.$refs.progressDataRef as any).submit();
      (this.$refs.sourceDataRef as any).submit();
      this.$nextTick().then(() => {
        this.nocontaminated = cloneDeep(this.taskData);
      });
    },

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

        const sourceList = workbookMap.get('source') as Record<
          string,
          string
        >[];
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
    },

    setPropTemplate(data: Record<string, string>): void {
      const { base_temp, process_temp, source_temp } = data;
      if (base_temp) this.propTemplate.base = base_temp;
      if (process_temp) this.propTemplate.process = process_temp;
      if (source_temp) this.propTemplate.source = source_temp;
    },

    async handleSave(): Promise<void> {
      this.loading = true;
      await this.$nextTick();
      (this.$refs.baseDataRef as any).submit();
      (this.$refs.progressDataRef as any).submit();
      (this.$refs.sourceDataRef as any).submit();
      await this.$nextTick();

      writeExcel(this.taskData);
      setTimeout(async () => {
        this.loading = false;
        this.nocontaminated = this.taskData;
      }, 500);
    },

    baseDataSubmit(object: Record<string, any>): void {
      this.taskData.base = cloneDeep(object);
    },

    progressDataSubmit(object: Record<string, any>): void {
      this.taskData.process = cloneDeep(object);
    },

    sourceDataSubmit(object: Record<string, any>[]): void {
      this.taskData.source = cloneDeep(object);
    },

    setBaseTempid(uuid: string): void {
      this.taskData.baseTempid = uuid;
    },

    setProcessTempid(uuid: string): void {
      this.taskData.processTempid = uuid;
    },

    setSourceTempid(uuid: string): void {
      this.taskData.sourceTempid = uuid;
    },

    bindKeyboard(): void {
      bind(
        'ctrl+s',
        () => {
          this.handleSave();
          return false;
        },
        'keydown'
      );
    },

    unBindKeyboard(): void {
      unbind('ctrl+s', 'keydown');
    },
  },
});
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
