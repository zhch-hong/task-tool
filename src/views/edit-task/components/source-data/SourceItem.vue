<template>
  <div class="source-item">
    <el-form label-width="100px">
      <el-form-item label="来源类型">
        <el-select v-model="sourceType" @change="sourceTypeChange">
          <el-option
            v-for="s in selectSourcetype"
            :key="s.id"
            :label="s.label"
            :value="s.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="进度折扣">
        <el-input
          v-model.trim="processDiscount"
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

@Component({
  components: {
    ConditionItem,
  },
})
export default class SourceItem extends Vue {
  @Prop({ type: Array, required: true }) selectSourcetype!: Record<
    string,
    any
  >[];
  @Prop({ type: Object, required: true }) sourceitemConfig!: Record<
    string,
    string | Record<string, string>[]
  >;
  @Prop({ type: Number, required: true }) lostConditionid!: number;
  @Prop({ type: String, required: true }) sourceId!: string;
  @Prop({ type: Boolean, required: true }) isEmit!: boolean;

  sourceType = this.sourceitemConfig.source_type as string;
  processDiscount = this.sourceitemConfig.process_discount || '';

  conditionList = this.sourceitemConfig.conditionList as Record<
    string,
    string
  >[];
  conditionnameList: Record<string, string>[] = [];
  conditionId = this.lostConditionid.toString();

  @Watch('sourceType', { immediate: true })
  sourceTypeWatch(value: string): void {
    const sourceItem = this.selectSourcetype.find((item) => item.id === value);
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
    this.setConditionId();
  }

  setConditionId(): void {
    if (this.conditionList.length > 0) {
      this.conditionId = this.conditionList[0].condition_id;
    }
  }

  sourceTypeChange(): void {
    this.conditionList = [];
    this.processDiscount = '';
  }

  appendCondition(): void {
    this.conditionList.push({
      uuid: uuid(),
      condition_id: this.conditionId,
      condition_name: '',
      condition_value: '',
      judge_type: '',
    });
  }

  submit(): void {
    // 拿condition_id
    let condition_id = '0';
    if (this.conditionList.length > 0) {
      condition_id = this.conditionList[0].condition_id;
    }

    const object = {
      condition_id: condition_id,
      process_discount: this.processDiscount,
      source_id: this.sourceId,
      source_type: this.sourceType,
      conditionList: cloneDeep(this.conditionList),
    };

    this.$emit('submit-itemdata', object);
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
