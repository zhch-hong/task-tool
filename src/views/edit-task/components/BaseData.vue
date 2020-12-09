<template>
  <fieldset>
    <legend>基础信息</legend>
    <el-form ref="ruleForm" :model="form" :rules="rules" label-width="100px">
      <!-- <el-form-item label="任务ID" prop="id">
        <el-input v-model="form.id"></el-input>
      </el-form-item> -->
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="任务说明" prop="desc">
        <el-input type="textarea" v-model="form.desc"></el-input>
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
import { Component, Vue } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';
import { Notification } from 'element-ui';

import store from '@/store';
import { propertySlice } from '@/utils/propertySlice';
import { sheetToJson } from '@/utils/sheetToJson';

import TaskReset from './base-data/TaskReset.vue';
import ValidTime from './base-data/ValidTime.vue';
import LimitTime from './base-data/LimitTime.vue';
import GetType from './base-data/GetType.vue';
import TaskEnum from './base-data/TaskEnum.vue';
import { getSheet } from '@/utils/likeSheet';

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

function getTask(): null | Record<string, string> {
  const id = store.state.updateTaskId;
  if (id !== '') {
    const workbook = store.state.workbook;

    if (!workbook) return null;

    const worksheet = getSheet(workbook, 'task');

    if (typeof worksheet === 'undefined') {
      Notification({
        title: '读取文件错误',
        message: '未获取到工作表【task】',
        type: 'error',
        duration: 0,
        position: 'bottom-right',
      });
      return null;
    }

    const res = sheetToJson(worksheet).find((item) => item.id === id);
    return res || null;
  }
  return null;
}

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
  form: Record<string, any> = cloneDeep(form);
  rules = {};

  created(): void {
    const object = getTask();
    if (object) {
      this.form = propertySlice(form, object);
      this.form.desc = object['任务内容说明'];
    }
  }

  submit(): void {
    this.$emit('submit', cloneDeep(this.form));
  }
}
</script>
