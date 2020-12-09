<template>
  <el-select v-model="selectvalue">
    <el-option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      :label="opt.name"
    ></el-option>
  </el-select>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { resolve } from 'path';

import { readFile } from '@/utils/fileStream';
import { getUserconfig } from '@/asserts/userconfig';

const filePath = resolve(
  getUserconfig().workDir,
  'app_config',
  'input-manage.json'
);

@Component
export default class GetType extends Vue {
  @Prop({ type: String, default: '' }) value!: string;

  options: Record<string, string>[] = [];

  get selectvalue(): string {
    return this.value;
  }
  set selectvalue(v: string) {
    this.$emit('input', v);
  }

  created(): void {
    const data: Record<string, any>[] = readFile(filePath);
    const object = data.find((item) => item.value === 'type');
    if (object) {
      this.options = object.select;
    }
  }
}
</script>
