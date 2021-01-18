<template>
  <div>
    <ContaminatList
      v-for="(item, index) in tableData"
      :key="index"
      :path="item.path"
      :book="item.book"
    />
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { flatTreedata, getTreeDataDefault } from '@/utils';
import { contaminatingData } from './methods';
import { WorkbookMap } from '@/shims-cust';

import ContaminatList from './components/ContaminatList.vue';

export default Vue.extend({
  name: 'validate-data',

  components: {
    ContaminatList,
  },

  data() {
    return {
      tableData: [] as Record<string, any>[],
    };
  },

  mounted() {
    const pathList: string[] = [];
    const array = getTreeDataDefault();
    flatTreedata(array, pathList);
    const promiseList: Promise<WorkbookMap>[] = [];
    pathList.forEach((path) => {
      promiseList.push(contaminatingData(path));
    });
    Promise.allSettled(promiseList)
      .then((array) => {
        array.forEach((object, index) => {
          if (object.status === 'fulfilled') {
            this.tableData.push({
              path: pathList[index],
              book: object.value,
            });
          }
        });
      })
      .catch((error: Error) => {
        console.error(error);
      });
  },

  methods: {},
});
</script>
