<template>
  <div>
    <el-input-number v-model="hour" :min="0"></el-input-number>
    <label>时</label>
    <el-input-number v-model="minute" :min="0" label="分"></el-input-number>
    <label>分</label>
    <el-input-number v-model="second" :min="0" label="秒"></el-input-number>
    <label>秒</label>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component
export default class LimitTime extends Vue {
  hour = 0;
  minute = 0;
  second = 0;

  @Watch('hour')
  hourChange(): void {
    this.emitParent();
  }
  @Watch('minute')
  minuteChange(): void {
    this.emitParent();
  }
  @Watch('hsecondour')
  secondChange(): void {
    this.emitParent();
  }

  emitParent(): void {
    const n = this.hour * 3600 + this.minute * 60 + this.second;
    if (n === 0) this.$emit('limit-time', -1);
    else this.$emit('limit-time', n);
  }
}
</script>
<style lang="scss" scoped>
label {
  margin-left: 6px;
  margin-right: 30px;
}
</style>
