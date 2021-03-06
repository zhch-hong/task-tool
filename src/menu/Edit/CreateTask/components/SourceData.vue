<template>
  <fieldset>
    <legend>来源配置</legend>
    <TemplateOption
      :uuid="template"
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
    <el-button style="margin-top: 10px" @click="appendSourceItem">添加来源</el-button>
  </fieldset>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { v4 as uuid } from 'uuid';
import { resolve } from 'path';
import { cloneDeep } from 'lodash';

import { readFileText } from '@/utils';

import SourceItem from './source-data/SourceItem.vue';
import TemplateOption from './TemplateOption.vue';
import store from '@/electron-store';

const filePath = resolve(store.get('configDir') as string, 'app_config', 'source-manage.json');
const readContent = readFileText(filePath);
const sourcetypeList: Record<string, any>[] = readContent ? readFileText(filePath)[0].children : [];

@Component({
  components: {
    SourceItem,
    TemplateOption,
  },
})
export default class SourceData extends Vue {
  @Prop() template?: string;
  @Prop({ type: Array, required: true }) sourceData!: Record<string, string>[];
  @Prop({ type: Array, required: true }) conditionData!: Record<string, string>[][];

  sourceList = this.sourceData;
  sourcetypeList = sourcetypeList;

  /** 告诉SourceItem组件，是否需要提交数据 */
  isEmit = false;

  /** 保存时的数据 */
  emitSourceList: Record<string, any>[] = [];

  @Watch('sourceData')
  dataWatch(value: Record<string, string>[]): void {
    this.sourceList = value;
  }

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

  async updateTemplate(method: (data: Record<string, any>) => void): Promise<void> {
    this.isEmit = true;
    await this.$nextTick();
    method(cloneDeep(this.emitSourceList));
    await this.$nextTick();
    this.isEmit = false;
    this.emitSourceList = [];
  }

  async saveTemplate(method: (data: Record<string, any>) => void): Promise<void> {
    this.isEmit = true;
    await this.$nextTick();
    method(cloneDeep(this.emitSourceList));
    await this.$nextTick();
    this.isEmit = false;
    this.emitSourceList = [];
  }
}
</script>
