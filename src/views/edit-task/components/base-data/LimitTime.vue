<template>
  <div>
    <el-input-number
      v-model="hour"
      :min="0"
      label="时"
      @change="emitParent"
    ></el-input-number>
    <label>时</label>
    <el-input-number
      v-model="minute"
      :min="0"
      label="分"
      @change="emitParent"
    ></el-input-number>
    <label>分</label>
    <el-input-number
      v-model="second"
      :min="0"
      label="秒"
      @change="emitParent"
    ></el-input-number>
    <label>秒</label>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class LimitTime extends Vue {
  @Prop({ type: [Number, String], required: true }) value!: string | number;

  hour = 0;
  minute = 0;
  second = 0;

  @Watch('value', { immediate: true })
  valueChange(value: number | string): void {
    value = parseInt(value.toString());
    if (value === -1) return;
    this.hour = Math.floor(value / 3600);
    this.minute = Math.floor((value % 3600) / 60);
    this.second = value - this.hour * 3600 - this.minute * 60;
  }

  emitParent(): void {
    const n = this.hour * 3600 + this.minute * 60 + this.second;
    if (n === 0) this.$emit('input', -1);
    else this.$emit('input', n);
  }
}
</script>
<style lang="scss" scoped>
label {
  margin-left: 6px;
  margin-right: 30px;
}
</style>
