<template>
  <fieldset>
    <legend>来源配置</legend>
    <SourceItem
      v-for="s in sourceList"
      :key="s.id"
      :source-config="sourceConfig"
    />
    <el-button>添加来源</el-button>
  </fieldset>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { readFile } from '@/utils/fileStream';

import SourceItem from './source-data/SourceItem.vue';

const filePath = 'D:\\JyQipai_doc\\app_config\\source-manage.json';
const data = readFile(filePath);

@Component({
  components: {
    SourceItem,
  },
})
export default class SourceData extends Vue {
  sourceList: Record<string, any>[] = [{ id: 1 }];
  sourceConfig = data[0].children;
}
</script>
