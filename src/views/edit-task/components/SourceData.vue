<template>
  <fieldset>
    <legend>来源配置</legend>
    <TemplateOption
      template-type="source"
      @template-data="templateData"
      @template-uuid="(v) => $emit('template-uuid', v)"
      @update-template="updateTemplate"
      @save-template="saveTemplate"
    />
    <SourceItem
      v-for="(s, index) in sourceList"
      :key="s.uuid"
      :sourceitem-config="s"
      :sourcetype-list="sourcetypeList"
      :prop-condition-list="conditionData[index] || []"
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
import { resolve } from 'path';
import { cloneDeep } from 'lodash';

import { readFileText } from '@/utils/fileSystem';
import { getUserconfig } from '@/asserts/userconfig';

import SourceItem from './source-data/SourceItem.vue';
import TemplateOption from './TemplateOption.vue';
import { stringify } from '@/utils';

const filePath = resolve(
  getUserconfig().workDir,
  'app_config',
  'source-manage.json'
);
const sourcetypeList: Record<string, any>[] = readFileText(filePath)[0]
  .children;

@Component({
  components: {
    SourceItem,
    TemplateOption,
  },
})
export default class SourceData extends Vue {
  @Prop({ type: Array, required: true }) sourceData!: Record<string, string>[];
  @Prop({ type: Array, required: true }) conditionData!: Record<
    string,
    string
  >[][];

  sourceList = this.sourceData;
  sourcetypeList = sourcetypeList;

  /** 告诉SourceItem组件，是否需要提交数据 */
  isEmit = false;

  /** 保存时的数据 */
  emitSourceList: Record<string, any>[] = [];

  appendSourceItem(): void {
    this.sourceList.push({
      uuid: uuid(),
      condition_id: '',
      process_discount: '',
      source_type: '',
    });
  }

  deleteSourceitem(index: number): void {
    this.sourceList.splice(index, 1);
    this.conditionData.splice(index, 1);
  }

  async submit(): Promise<void> {
    this.isEmit = true;
    await this.$nextTick();
    this.$emit('submit', this.emitSourceList);
    await this.$nextTick();
    this.isEmit = false;
    this.emitSourceList = [];
  }

  templateData(data: any): void {
    this.sourceData.splice(0, this.sourceData.length);
    this.sourceData.push(...data.source);
    this.conditionData.splice(0, this.conditionData.length);
    this.conditionData.push(...data.condition);
  }

  async updateTemplate(
    method: (data: Record<string, any>) => void
  ): Promise<void> {
    this.isEmit = true;
    await this.$nextTick();
    method(cloneDeep(this.emitSourceList));
    await this.$nextTick();
    this.isEmit = false;
    this.emitSourceList = [];
  }

  async saveTemplate(
    method: (data: Record<string, any>) => void
  ): Promise<void> {
    this.isEmit = true;
    await this.$nextTick();
    method(cloneDeep(this.emitSourceList));
    await this.$nextTick();
    this.isEmit = false;
    this.emitSourceList = [];
  }
}
</script>
