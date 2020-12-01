<template>
  <el-date-picker
    v-model="value"
    type="datetimerange"
    value-format="timestamp"
    range-separator="至"
    start-placeholder="开始时间"
    end-placeholder="结束时间"
  >
  </el-date-picker>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ValidTime extends Vue {
  @Prop({ type: [Number, String], required: true }) start!: number | string;
  @Prop({ type: [Number, String], required: true }) end!: number | string;

  get value(): null | number[] {
    if (this.start === 0 && this.end === 0) return null;
    return [
      parseInt(this.start.toString()) * 1000,
      parseInt(this.end.toString()) * 1000,
    ];
  }
  set value(array: number[] | null) {
    if (array) {
      this.$emit('start', array[0] / 1000);
      this.$emit('end', array[1] / 1000);
    }
  }
}
</script>
