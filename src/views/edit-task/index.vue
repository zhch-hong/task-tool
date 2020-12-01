<template>
  <div>
    <BaseData ref="baseData" @submit="baseData" />
    <ProgressData ref="progressData" @submit="progressData" />
    <SourceData />
    <el-button @click="handleSave">保存</el-button>
  </div>
</template>
<script lang="ts">
import store from '@/store';
import { Component, Vue } from 'vue-property-decorator';
import { NavigationGuardNext, Route } from 'vue-router';

import BaseData from './components/BaseData.vue';
import ProgressData from './components/ProgressData.vue';
import SourceData from './components/SourceData.vue';

@Component({
  components: {
    BaseData,
    ProgressData,
    SourceData,
  },
  beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext): void {
    store.commit('updateTaskId', '');
    next();
  },
})
export default class EditTask extends Vue {
  $refs!: {
    baseData: any;
    progressData: any;
  };

  handleSave(): void {
    this.$refs.baseData.submit();
    this.$refs.progressData.submit();
  }

  baseData(object: Record<string, any>): void {
    console.log('baseData', JSON.parse(JSON.stringify(object)));
  }

  progressData(object: Record<string, any>): void {
    console.log('progressData', JSON.parse(JSON.stringify(object)));
  }
}
</script>
