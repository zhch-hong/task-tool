<template>
  <div style="margin-bottom: 10px">
    <el-select
      v-model="conditionItem.condition_name"
      @change="parseConditionValueMode"
    >
      <el-option
        v-for="name in conditionnameList"
        :key="name.id"
        :value="name.id"
        :label="name.label"
      ></el-option>
    </el-select>
    <el-select v-model="conditionItem.judge_type" style="margin: 0 10px">
      <el-option label="=" value="2"></el-option>
      <el-option label=">=" value="3"></el-option>
      <el-option label="<=" value="4"></el-option>
      <el-option label="~=" value="5"></el-option>
    </el-select>
    <el-select
      v-if="conditionValueMode === 'select'"
      v-model="conditionItem.condition_value"
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
      v-model="conditionItem.condition_value"
      style="width: 215px"
    ></el-input>
    <el-button style="margin-left: 10px" @click="$emit('delete-condition')"
      >删除条件</el-button
    >
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

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

  /** 如果条件名称下面配置了条件值，则进行下拉选择 */
  selectConditionValues: string[] = [];
  /** 条件值是输入还是下拉框选择 */
  conditionValueMode: 'input' | 'select' = 'select';

  /**
   * 当条件名称下拉框数据重置时，需要清空选择的值
   */
  @Watch('conditionnameList')
  conditionnameListChange(): void {
    this.conditionItem.condition_name = '';
    this.conditionItem.judge_type = '';
    this.conditionItem.condition_value = '';
  }

  created(): void {
    this.parseConditionValueMode();
  }

  /**
   * 当前条件值是选择方式还是输入方式
   */
  parseConditionValueMode(value?: string): void {
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
}
</script>
