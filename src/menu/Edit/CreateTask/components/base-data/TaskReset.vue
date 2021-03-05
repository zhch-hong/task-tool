<template>
  <div>
    <el-switch v-model="resetSwitch" style="margin-right: 20px"> </el-switch>
    <el-input-number
      v-model="resetNumber"
      :disabled="disabled"
      :min="0"
      label="重置间隔（天）"
      @change="numberChange"
    ></el-input-number>
    <span style="margin-left: 6px">天</span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TaskReset extends Vue {
  @Prop({ type: [Boolean, String], default: 'false' }) value!: string | boolean;
  @Prop({ type: [Number, String], default: 0 }) resetDelay!: number | string;

  get disabled(): boolean {
    return this.value.toString().toLowerCase() === 'false';
  }

  get resetSwitch(): boolean {
    return this.value.toString().toLowerCase() === 'true';
  }
  set resetSwitch(b: boolean) {
    this.$emit('input', b);
  }

  get resetNumber(): number {
    return parseInt(this.resetDelay.toString());
  }
  set resetNumber(n: number) {
    //
  }

  numberChange(n: number): void {
    this.$emit('reset-delay', n);
  }
}
</script>
