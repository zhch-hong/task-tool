<template>
  <fieldset>
    <legend>来源配置</legend>
    <SourceItem
      v-for="(s, index) in sourceList"
      :key="s.uuid"
      :sourceitem-config="s"
      :select-sourcetype="selectSourcetype"
      :source-id="sourceId"
      :lost-conditionid="lostConditionidArray()"
      :is-emit="isEmit"
      @delete-sourceitem="deleteSourceitem(index)"
      @submit-itemdata="(o) => emitSourceList.push(o)"
    />
    <el-button style="margin-top: 10px" @click="appendSourceItem"
      >添加来源</el-button
    >
  </fieldset>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { v4 as uuid } from 'uuid';

import store from '@/store';
import { readFile } from '@/utils/fileStream';
import { sheetToJson } from '@/utils/sheetToJson';
import { lostIdArray } from '../utils/lostIdArray';

import SourceItem from './source-data/SourceItem.vue';
import { getSheet } from '@/utils/likeSheet';

const filePath = 'D:\\JyQipai_doc\\app_config\\source-manage.json';
const selectSourcetype: Record<string, any>[] = readFile(filePath);

function getSource():
  | Record<string, string | Record<string, string>[]>[]
  | undefined {
  const wb = store.state.workbook;
  if (!wb) return;
  const wsTask = getSheet(wb, 'task');
  if (!wsTask) return;

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
      const sourceId = process.source_id;
      const sourceSheet = wb.getWorksheet('source');
      const sourceList = sheetToJson(sourceSheet).filter(
        (s) => s.source_id.toString() === sourceId.toString()
      );

      const conditionSheet = wb.getWorksheet('condition');
      const conditionJson = sheetToJson(conditionSheet);

      const sourceItemList: Record<string, any>[] = [];
      sourceList.forEach((s) => {
        const conditionList = conditionJson.filter(
          (c) => c.condition_id.toString() === s.condition_id.toString()
        );
        conditionList.forEach((item) => (item.uuid = uuid()));
        const item = Object.assign({ uuid: uuid() }, s, { conditionList });
        sourceItemList.push(item);
      });

      return sourceItemList;
    }
  }
}

@Component({
  components: {
    SourceItem,
  },
})
export default class SourceData extends Vue {
  /**
   * 这个id只有在该任务没有配置任何来源时，添加任务来源的时候作为任务来源source_id使用
   * 如果该任务已经有任务来源，则添加任务来源时使用和已有的任务来源相同的source_id
   */
  @Prop({ type: Number, required: true }) lostSourceid!: number;

  sourceList: Record<string, string | Record<string, string>[]>[] = [];
  selectSourcetype: Record<string, any> = selectSourcetype[0].children;
  lostConditionidArray = lostIdArray('condition', 'condition_id');
  sourceId = this.lostSourceid.toString();

  /** 告诉SourceItem组件，是否需要提交数据 */
  isEmit = false;

  /** 保存数据时每条来源的数据 */
  emitSourceList: Record<string, any>[] = [];

  created(): void {
    const sourceItemList = getSource();
    if (sourceItemList) {
      this.sourceList = sourceItemList;
    }

    if (this.sourceList.length > 0) {
      this.sourceId = this.sourceList[0].source_id as string;
    }
  }

  appendSourceItem(): void {
    this.sourceList.push({
      uuid: uuid(),
      conditionList: [],
      condition_id: '',
      process_discount: '',
      source_id: this.sourceId,
      source_type: '',
    });
  }

  deleteSourceitem(index: number): void {
    this.sourceList.splice(index, 1);
  }

  async submit(): Promise<void> {
    this.isEmit = true;
    await this.$nextTick();
    this.$emit('submit', this.emitSourceList);
    await this.$nextTick();
    this.isEmit = false;
    this.emitSourceList = [];
  }
}
</script>
