<template>
  <div id="edit-task">
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
import { cloneDeep } from 'lodash';
import { bind, unbind } from 'mousetrap';
import { remote } from 'electron';

import { writeExcel } from './utils/writeExcel';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { ActiveFileModule } from '@/store/modules/active-file';
import { ActiveTaskModule } from '@/store/modules/active-task';

import BaseData from './components/BaseData.vue';
import ProgressData from './components/ProgressData.vue';
import SourceData from './components/SourceData.vue';

export default Vue.extend({
  components: {
    BaseData,
    ProgressData,
    SourceData,
  },

  data() {
    return {
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

  methods: {
    /**
     * 关闭对话框前需要检测是否已经修改了数据
     * 提示是否需要先保存再关闭
     */
    async beforeClose(): Promise<void> {
      (this.$refs.baseDataRef as any).submit();
      (this.$refs.progressDataRef as any).submit();
      (this.$refs.sourceDataRef as any).submit();
      await this.$nextTick();

      const oldData = JSON.stringify(this.nocontaminated);
      const newData = JSON.stringify(this.taskData);

      if (!(oldData.startsWith(newData) && oldData.endsWith(newData))) {
        const { dialog, getCurrentWindow } = remote;
        const win = getCurrentWindow();
        win.focus();
        const response = dialog.showMessageBoxSync(win, {
          title: '数据变动',
          message: '检测到数据已经改动，并尚未保存，离开将丢弃数据',
          type: 'warning',
          cancelId: -1,
          defaultId: 1,
          buttons: ['取消', '保存', '放弃改动'],
        });
        if (response === 2) {
          ActiveTaskModule.SET_TASKID('');
        } else if (response === 1) {
          this.handleSave().then(() => {
            ActiveTaskModule.SET_TASKID('');
          });
        } else {
          return Promise.reject();
        }
      } else {
        ActiveTaskModule.SET_TASKID('');
      }

      return Promise.resolve();
    },

    /**
     * 获取没有修改过的数据，用于离开页面时数据保存提示
     * 如果是添加任务，获取的数据各项项字段都为空值
     * 如果是修改任务，获取的数据就是当前任务的数据
     */
    getNocontaminated(): void {
      (this.$refs.baseDataRef as any).submit();
      (this.$refs.progressDataRef as any).submit();
      (this.$refs.sourceDataRef as any).submit();
      this.$nextTick().then(() => {
        this.nocontaminated = cloneDeep(this.taskData);
      });
    },

    async getUpdateTaskData(): Promise<void> {
      const id = ActiveTaskModule.taskId;
      if (id !== '') {
        const path = ActiveFileModule.path;

        if (!path) {
          return Promise.reject();
        }

        const workbookMap = await WorkspacedModule.bookMapByPath(path);
        const taskList = workbookMap.get('task') as Record<string, string>[];
        const taskJson = taskList.find((item) => item.id.toString() === id.toString()) as Record<string, string>;

        // 基础数据
        this.baseData = taskJson;

        // 使用的模板
        this.setPropTemplate(taskJson);

        const { process_id } = taskJson;
        const processList = workbookMap.get('process_data') as Record<string, string>[];
        const processJson = processList.find((item) => item.process_id === process_id) as Record<string, string>;

        // 进度数据
        this.processData = processJson;

        const { source_id, awards } = processJson;
        const awardList = workbookMap.get('award_data') as Record<string, string>[];

        // 奖励数据
        this.awardData = awards.split(',').map((award_id) => {
          return awardList.filter((award) => award.award_id == award_id);
        });

        const sourceList = workbookMap.get('source') as Record<string, string>[];

        // 来源数据
        this.sourceData = sourceList.filter((source) => source.source_id === source_id);

        const conditionList = workbookMap.get('condition') as Record<string, string>[];

        // 条件数据
        this.conditionData = this.sourceData.map((source: Record<string, string>) => {
          return conditionList.filter((condition) => condition.condition_id === source.condition_id);
        });

        return Promise.resolve();
      } else {
        this.baseData = null;
        this.processData = null;
        this.sourceData = [];
        this.awardData = [];
        this.sourceData = [];
        this.conditionData = [];

        return Promise.resolve();
      }
    },

    setPropTemplate(data: Record<string, string>): void {
      const { base_temp, process_temp, source_temp } = data;
      if (base_temp) this.propTemplate.base = base_temp;
      if (process_temp) this.propTemplate.process = process_temp;
      if (source_temp) this.propTemplate.source = source_temp;
    },

    async handleSave(): Promise<void> {
      await this.$nextTick();
      (this.$refs.baseDataRef as any).submit();
      (this.$refs.progressDataRef as any).submit();
      (this.$refs.sourceDataRef as any).submit();
      await this.$nextTick();

      writeExcel(this.taskData);

      return Promise.resolve();
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
  height: 65vh;
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
