<template>
  <fieldset>
    <legend>基础信息</legend>
    <el-form ref="ruleForm" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="任务ID" prop="id">
        <el-input v-model="form.id"></el-input>
      </el-form-item>
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="任务说明" prop="desc">
        <el-input type="textarea" v-model="form.desc"></el-input>
      </el-form-item>
      <el-form-item label="任务重置">
        <TaskReset :task-reset="propTaskReset" @task-reset="taskReset" />
      </el-form-item>
      <el-form-item label="有效时段">
        <ValidTime :valid-time="propValidTime" @valid-time="validTime" />
      </el-form-item>
      <el-form-item label="任务限时" prop="time_limit">
        <LimitTime
          :limit-time="propLimitTime"
          @limit-time="(v) => (form.time_limit = v)"
        />
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
import { Component, Vue } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';

import TaskReset from './base-data/TaskReset.vue';
import ValidTime from './base-data/ValidTime.vue';
import LimitTime from './base-data/LimitTime.vue';
import GetType from './base-data/GetType.vue';
import TaskEnum from './base-data/TaskEnum.vue';

const form = {
  id: '',
  name: '',
  desc: '',
  is_reset: false,
  reset_delay: 0,
  start_valid_time: 0,
  end_valid_time: 0,
  time_limit: -1,
  own_type: '',
  task_enum: '',
};

@Component({
  components: {
    TaskReset,
    ValidTime,
    LimitTime,
    GetType,
    TaskEnum,
  },
})
export default class BaseData extends Vue {
  form = cloneDeep(form);
  rules = {};

  propTaskReset = '';
  propValidTime = '';
  propLimitTime = '';

  taskReset(object: Record<string, boolean | number>): void {
    Object.assign(this.form, object);
  }

  validTime(value: number[]): void {
    this.form.start_valid_time = value[0];
    this.form.end_valid_time = value[1];
  }
}
</script>
