<template>
  <div></div>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'validate-data',

  methods: {
    getProcessIdList(taskList: Record<string, string>[]): string[] {
      return taskList.map((t) => t.process_id.toString());
    },

    filtProcess(
      processIdList: string[],
      processList: Record<string, string>[]
    ) {
      const sourceIdList: string[] = [];
      const awardIdList: string[] = [];

      processIdList.forEach((id) => {
        const index = processList.findIndex((p) => p.process_id == id);
        if (index !== -1) {
          sourceIdList.push(processList[index].source_id.toString());
          awardIdList.push(...processList[index].awards.split(','));
          processList.splice(index, 1);
        }
      });

      return {
        sourceIdList,
        awardIdList,
      };
    },

    filtSource(
      sourceIdList: string[],
      sourceList: Record<string, string>[]
    ): Set<string> {
      sourceIdList.forEach((id) => {
        sourceList.filter((source) => {});
      });
    },
  },
});
</script>
