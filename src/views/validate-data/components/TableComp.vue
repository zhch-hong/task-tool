<template>
  <div style="margin: 10px 0">
    <span>{{ title }}</span>
    <vxe-table :data="tableData">
      <vxe-table-column
        v-for="col in columns"
        :key="col"
        :field="col"
        :title="col"
        show-overflow="title"
      ></vxe-table-column>
    </vxe-table>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'TableComp',

  props: {
    title: String,
    data: Array as PropType<Record<string, string>[]>,
  },

  data() {
    return {
      columns: [] as string[],
      tableData: [] as Record<string, string>[],
    };
  },

  watch: {
    data: {
      immediate: true,
      handler(value: Record<string, string>[]) {
        if (value.length === 0) return;
        value.forEach((it) => delete it.uuid);
        this.columns = Object.keys(value[0]);
        this.$nextTick(() => {
          this.tableData = value;
        });
      },
    },
  },
});
</script>
