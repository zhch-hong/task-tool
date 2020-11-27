<template>
  <div>
    <BaseData />
    <ProgressData />
    <RewardData />
    <SourceData />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import BaseData from './components/BaseData.vue';
import ProgressData from './components/ProgressData.vue';
import RewardData from './components/RewardData.vue';
import SourceData from './components/SourceData.vue';

@Component({
  components: {
    BaseData,
    ProgressData,
    RewardData,
    SourceData,
  },
})
export default class EditTask extends Vue {}
</script>
