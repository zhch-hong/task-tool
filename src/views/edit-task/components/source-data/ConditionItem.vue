<template>
  <div style="margin-bottom: 10px">
    <el-select v-model="conditionForm.condition_name" @change="emitCondition">
      <el-option
        v-for="name in conditionnameList"
        :key="name.id"
        :value="name.id"
        :label="name.label"
      ></el-option>
    </el-select>
    <el-select
      v-model="conditionForm.judge_type"
      style="margin: 0 10px"
      @change="emitCondition"
    >
      <el-option label="=" :value="2"></el-option>
      <el-option label=">=" :value="3"></el-option>
      <el-option label="<=" :value="4"></el-option>
      <el-option label="~=" :value="5"></el-option>
    </el-select>
    <el-select
      v-if="conditionValueMode === 'select'"
      v-model="conditionForm.condition_value"
      @change="emitCondition"
    >
      <el-option
        v-for="value in selectConditionValues"
        :key="value.id"
        :label="value.label"
        :value="value.id"
      ></el-option>
    </el-select>
    <el-input
      v-if="conditionValueMode === 'input'"
      v-model="conditionForm.condition_value"
      @change="emitCondition"
      style="width: 215px"
    ></el-input>
    <el-button style="margin-left: 10px" @click="$emit('delete-condition')"
      >删除条件</el-button
    >
  </div>
</template>
<script lang="ts">
import { stringify } from '@/utils';
import { cloneDeep } from 'lodash';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

const condition = {
  condition_id: '',
  condition_name: '',
  condition_value: '',
  judge_type: '',
  备注: '',
};

@Component
export default class ConditionItem extends Vue {
  /** 奖励条件名称下拉框 */
  @Prop({ type: Array, required: true }) conditionnameList!: Record<
    string,
    any
  >[];
  /** 单条奖励条件数据 */
  @Prop({ type: Object, required: true }) conditionItem!: Record<
    string,
    string
  >;

  conditionForm = cloneDeep(condition);
  /** 如果条件名称下面配置了条件值，则进行下拉选择 */
  selectConditionValues: string[] = [];
  /** 条件值是输入还是下拉框选择 */
  conditionValueMode: 'input' | 'select' = 'input';

  @Watch('conditionForm.condition_name', { immediate: true })
  nameWatch(value: string): void {
    value = value || this.conditionItem.condition_name;
    const res = this.conditionnameList.find((item) => item.id === value);
    if (res) {
      if (typeof res.children === 'undefined' || res.children.length === 0) {
        this.conditionValueMode = 'input';
      } else {
        this.conditionValueMode = 'select';
        this.selectConditionValues = res.children;
      }
    }
  }

  async created(): Promise<void> {
    Object.assign(this.conditionForm, this.conditionItem);
  }

  emitCondition(): void {
    this.$emit('update-condition', cloneDeep(this.conditionForm));
  }
}
</script>
