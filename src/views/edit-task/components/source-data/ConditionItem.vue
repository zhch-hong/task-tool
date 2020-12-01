<template>
  <div>
    <el-select v-model="waySource" @change="parseValueWay">
      <el-option
        v-for="way in wayList"
        :key="way.id"
        :value="way.id"
        :label="way.label"
      ></el-option>
    </el-select>
    <el-select v-model="wayContrast">
      <el-option label=">" value="more"></el-option>
      <el-option label="<" value="less"></el-option>
      <el-option label="=" value="equal"></el-option>
      <el-option label=">=" value="moreEq"></el-option>
      <el-option label="<=" value="lessEq"></el-option>
    </el-select>
    <el-select v-if="wayValueMode === 'select'" v-model="wayValue">
      <el-option
        v-for="value in wayValues"
        :key="value"
        :label="value"
        :value="value"
      ></el-option>
    </el-select>
    <el-input v-if="wayValueMode === 'input'" v-model="wayValue"></el-input>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ConditionItem extends Vue {
  @Prop({ type: Array, required: true }) sourceConfig!: Record<string, any>[];

  wayList: Record<string, string>[] = [];
  wayValues: number[] = [];
  wayValueMode: 'input' | 'select' = 'select';

  waySource = '';
  wayContrast = '';
  wayValue: number | string = '';

  created(): void {
    this.parseWayList();
  }

  parseWayList(): void {
    this.wayList = this.sourceConfig;
  }

  parseValueWay(value: string): void {
    const res = this.sourceConfig.find((item) => item.id === value);
    if (res) {
      if (typeof res.children === 'undefined' || res.children.length === 0) {
        this.wayValueMode = 'input';
      } else {
        this.wayValueMode = 'select';
        this.wayValues = res.children;
      }
    }
  }
}
</script>
