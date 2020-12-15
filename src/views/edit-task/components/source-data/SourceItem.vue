<template>
  <div class="source-item">
    <el-form label-width="100px">
      <el-form-item label="来源类型">
        <el-select v-model="sourceForm.source_type" @change="sourceTypeChange">
          <el-option
            v-for="s in sourcetypeList"
            :key="s.id"
            :label="s.label"
            :value="s.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="进度折扣">
        <el-input
          v-model.trim="sourceForm.process_discount"
          style="width: 215px"
        ></el-input>
      </el-form-item>
      <el-form-item label="奖励条件">
        <div>
          <ConditionItem
            v-for="(c, i) in conditionList"
            :key="c.uuid"
            :condition-item="c"
            :conditionname-list="conditionnameList"
            @delete-condition="() => conditionList.splice(i, 1)"
            @update-condition="updateCondition(i, $event)"
          />
          <el-button @click="appendCondition">添加条件</el-button>
        </div>
      </el-form-item>
    </el-form>
    <div style="text-align: right; margin-top: 10px">
      <el-button type="danger" @click="$emit('delete-sourceitem')"
        >删除来源</el-button
      >
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { v4 as uuid } from 'uuid';

import ConditionItem from './ConditionItem.vue';
import { cloneDeep } from 'lodash';
import { stringify } from '@/utils';

const source = {
  id: '',
  source_id: '',
  source_type: '',
  condition_id: '',
  process_discount: '',
};

@Component({
  components: {
    ConditionItem,
  },
})
export default class SourceItem extends Vue {
  @Prop({ type: Array, required: true }) sourcetypeList!: Record<string, any>[];
  @Prop({ type: Object, required: true }) sourceitemConfig!: Record<
    string,
    string
  >;
  @Prop({ type: Array, default: () => [] }) propConditionList!: Record<
    string,
    string
  >[];
  @Prop({ type: Boolean, required: true }) isEmit!: boolean;

  conditionList = this.propConditionList;
  sourceForm = cloneDeep(source);
  conditionnameList: Record<string, any>[] = [];

  @Watch('sourceForm.source_type', { immediate: true })
  sourceWatch(value: string): void {
    const sourceItem = this.sourcetypeList.find((item) => item.id === value);
    if (sourceItem) {
      this.conditionnameList = sourceItem.children;
    } else {
      this.conditionnameList = [];
    }
  }

  @Watch('isEmit')
  emitChange(b: boolean): void {
    if (b) this.submit();
  }

  created(): void {
    Object.assign(this.sourceForm, this.sourceitemConfig);
  }

  sourceTypeChange(): void {
    const l = this.conditionList.length;
    this.conditionList.splice(0, l);
    this.sourceForm.process_discount = '';
  }

  appendCondition(): void {
    this.conditionList.push({
      uuid: uuid(),
      condition_name: '',
      condition_value: '',
      judge_type: '',
    });
  }

  updateCondition(index: number, payload: Record<string, string>): void {
    this.conditionList.splice(index, 1, payload);
  }

  submit(): void {
    this.$emit('submit-itemdata', {
      source: this.sourceForm,
      condition: this.conditionList,
    });
  }
}
</script>
<style lang="scss" scoped>
.source-item {
  background-color: #f2f2f2;
  padding: 20px 20px 20px 0;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>
