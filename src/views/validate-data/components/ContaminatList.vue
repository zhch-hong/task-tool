<template>
  <div>
    <h2>{{ path }}</h2>
    <TableComp title="Process" :data="processData" />
    <TableComp title="Source" :data="sourceData" />
    <TableComp title="Condition" :data="conditionData" />
    <TableComp title="Award" :data="awardData" />
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';
import { WorkbookMap } from '@/shims-cust';

import TableComp from './TableComp.vue';

export default Vue.extend({
  name: 'ContaminatList',

  components: {
    TableComp,
  },

  props: {
    path: String,
    book: Map as PropType<WorkbookMap>,
  },

  data() {
    return {
      processData: this.book.get('process_data'),
      sourceData: this.book.get('source'),
      conditionData: this.book.get('condition'),
      awardData: this.book.get('award_data'),
    };
  },

  methods: {},
});
</script>
