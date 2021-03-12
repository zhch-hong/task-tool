<template>
  <fieldset>
    <legend>基础信息</legend>
    <TemplateOption
      :uuid="template"
      template-type="base"
      @template-data="templateData"
      @template-uuid="(v) => $emit('template-uuid', v)"
      @update-template="updateTemplate"
      @save-template="saveTemplate"
    />
    <el-form ref="ruleForm" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="任务ID" prop="id">
        <el-input v-model.trim="form.id"></el-input>
      </el-form-item>
      <el-form-item label="任务名称" prop="name">
        <el-input v-model.trim="form.name"></el-input>
      </el-form-item>
      <el-form-item label="任务说明" prop="任务内容说明">
        <el-input type="textarea" v-model.trim="form.任务内容说明"></el-input>
      </el-form-item>
      <el-form-item label="任务重置">
        <TaskReset
          v-model="form.is_reset"
          :reset-delay="form.reset_delay"
          @reset-delay="(v) => (form.reset_delay = v)"
        />
      </el-form-item>
      <el-form-item label="有效时段">
        <ValidTime
          :start="form.start_valid_time"
          :end="form.end_valid_time"
          @start="(v) => (form.start_valid_time = v)"
          @end="(v) => (form.end_valid_time = v)"
        />
      </el-form-item>
      <el-form-item label="任务限时" prop="time_limit">
        <LimitTime v-model="form.time_limit" />
      </el-form-item>
      <el-form-item label="获得类型" prop="own_type">
        <GetType v-model="form.own_type" />
      </el-form-item>
      <el-form-item label="任务枚举" prop="task_enum">
        <TaskEnum v-model="form.task_enum" />
      </el-form-item>
    </el-form>
  </fieldset>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import _, { cloneDeep } from 'lodash';

import { propertySlice } from '@/utils';

import TaskReset from './base-data/TaskReset.vue';
import ValidTime from './base-data/ValidTime.vue';
import LimitTime from './base-data/LimitTime.vue';
import GetType from './base-data/GetType.vue';
import TaskEnum from './base-data/TaskEnum.vue';
import TemplateOption from './TemplateOption.vue';

const form = {
  id: '',
  enable: '',
  name: '',
  任务内容说明: '',
  is_reset: false,
  reset_delay: 0,
  start_valid_time: 0,
  end_valid_time: 0,
  time_limit: -1,
  own_type: '',
  task_enum: '',
  process_id: '',
  获得类型: '',
};

@Component({
  components: {
    TaskReset,
    ValidTime,
    LimitTime,
    GetType,
    TaskEnum,
    TemplateOption,
  },
})
export default class BaseData extends Vue {
  @Prop() baseData!: Record<string, string> | null;
  @Prop() template?: string;

  form: Record<string, any> = cloneDeep(form);
  rules = {};

  @Watch('baseData')
  dataWatch(value: Record<string, string>): void {
    if (value) this.form = propertySlice(form, value);
    else this.form = {};
  }

  submit(): void {
    this.$emit('submit', cloneDeep(this.form));
  }

  templateData(data: Record<string, string>): void {
    const duplicate = _.cloneDeep(this.form);
    this.form = _.assign(duplicate, data);
  }

  updateTemplate(method: (data: Record<string, any>) => void): void {
    const baseData = cloneDeep(this.form);
    method(baseData);
  }

  saveTemplate(method: (data: Record<string, any>) => void): void {
    const baseData = cloneDeep(this.form);
    method(baseData);
  }
}
</script>
