<template>
  <el-form v-once class="about" label-width="100px" labe>
    <el-form-item>
      <template #label>
        <span class="label">Version:</span>
      </template>
      <span>{{ version }}</span>
    </el-form-item>
    <el-form-item>
      <template #label>
        <span class="label">Vue:</span>
      </template>
      <span>{{ vue }}</span>
    </el-form-item>
    <el-form-item>
      <template #label>
        <span class="label">Electron:</span>
      </template>
      <span>{{ electron }}</span>
    </el-form-item>
    <el-form-item>
      <template #label>
        <span class="label">Chrome:</span>
      </template>
      <span>{{ chrome }}</span>
    </el-form-item>
    <el-form-item>
      <template #label>
        <span class="label">Node:</span>
      </template>
      <span>{{ node }}</span>
    </el-form-item>
    <el-form-item>
      <template #label>
        <span class="label">V8:</span>
      </template>
      <span>{{ v8 }}</span>
    </el-form-item>
    <el-form-item>
      <template #label>
        <span class="label">OS:</span>
      </template>
      <span>{{ os }}</span>
    </el-form-item>
  </el-form>
</template>
<script lang="ts">
import Vue from 'vue';
import os from 'os';
import { remote } from 'electron';

export default Vue.extend({
  data() {
    const { app } = remote;
    const { electron, chrome, node, v8 } = process.versions;
    return {
      version: app.getVersion(),
      vue: Vue.version,
      electron,
      chrome,
      node,
      v8,
      os: os.version() + '_' + os.arch() + '_' + os.release(),
    };
  },
});
</script>
<style scoped>
span {
  font-size: 14px;
  font-weight: 600;
  color: #595959;
}
span.label {
  font-size: 16px;
  color: #595959;
}
form.about .el-form-item--small.el-form-item {
  margin-bottom: 0;
}
</style>
