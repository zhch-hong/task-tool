<template>
  <div>
    <ConfigTable :config-path="configPath" />
    <FileTree :config-path="configPath" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import ConfigTable from './components/ConfigTable.vue';
import FileTree from './components/FileTree.vue';

const configPath = 'D:\\JyQipai_doc\\app_config\\file-manage.json';

@Component({
  components: {
    ConfigTable,
    FileTree,
  },
})
export default class FileManage extends Vue {
  configPath = configPath;
}
</script>
