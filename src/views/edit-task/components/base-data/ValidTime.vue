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
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component
export default class ValidTime extends Vue {
  value: null | number[] = null;

  @Watch('value', { immediate: true })
  valueChange(value: null | number[]): void {
    if (value) this.$emit('valid-time', value);
    else this.$emit('valid-time', [0, 0]);
  }
}
</script>
