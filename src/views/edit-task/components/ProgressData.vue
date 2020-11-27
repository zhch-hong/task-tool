<template>
  <fieldset>
    <legend>进度配置</legend>
    <el-form label-width="100px">
      <el-form-item label="完整进度">
        <el-tooltip
          effect="dark"
          content="使用-进行进度连接"
          placement="top-start"
        >
          <el-input
            v-model.trim="form.process"
            placeholder="100-200-300"
          ></el-input>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="最后阶段循环">
        <el-switch v-model="form.lastLoop"> </el-switch>
      </el-form-item>
      <el-form-item label="初始进度">
        <el-input v-model="form.pre_add_process"> </el-input>
      </el-form-item>
    </el-form>
  </fieldset>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';

const form = {
  process: '',
  lastLoop: false,
  pre_add_process: '',
};

@Component
export default class ProgressData extends Vue {
  form = cloneDeep(form);
}
</script>
