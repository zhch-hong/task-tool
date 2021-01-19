<template>
  <el-select v-model="selectvalue" filterable allow-create>
    <el-option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      :label="opt.name"
    >
      <span style="float: left; margin-right: 20px">{{ opt.name }}</span>
      <span style="float: right; color: #8492a6; font-size: 13px">{{
        opt.value
      }}</span></el-option
    >
  </el-select>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { resolve } from 'path';

import { readFileText } from '@/utils/fileSystem';
import { configDir } from '@/asserts/dir-config';

const filePath = resolve(configDir, 'app_config', 'input-manage.json');

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
    const data: Record<string, any>[] = readFileText(filePath);
    const object = data.find((item) => item.value === 'type');
    if (object) {
      this.options = object.select;
    }
  }
}
</script>
