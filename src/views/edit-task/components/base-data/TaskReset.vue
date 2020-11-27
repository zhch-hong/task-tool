<template>
  <div>
    <el-switch v-model="resetSwitch" style="margin-right: 20px"> </el-switch>
    <el-input-number
      v-model="resetNumber"
      :disabled="disabled"
      :min="0"
      label="重置间隔（天）"
    ></el-input-number>
    <span style="margin-left: 6px">天</span>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component
export default class TaskReset extends Vue {
  resetSwitch = false;
  resetNumber = 0;
  disabled = false;

  @Watch('resetSwitch', { immediate: true })
  switchChange(bool: boolean): void {
    this.disabled = !bool;
    this.$emit('task-reset', {
      is_reset: this.resetSwitch,
      reset_delay: this.resetNumber,
    });
  }
  @Watch('resetNumber')
  numberChange(value: number): void {
    this.$emit('task-reset', {
      is_reset: this.resetSwitch,
      reset_delay: value,
    });
  }
}
</script>
