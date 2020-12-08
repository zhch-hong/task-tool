<template>
  <div>
    <ConfigTable :config-path="configPath" />
    <FileTree :config-path="configPath" />
  </div>
</template>
<script lang="ts">
import { resolve } from 'path';
import { Component, Vue } from 'vue-property-decorator';

import ConfigTable from './components/ConfigTable.vue';
import FileTree from './components/FileTree.vue';

import { userdir } from '@/asserts/userdir';
import { readFile } from '@/utils/fileStream';

@Component({
  components: {
    ConfigTable,
    FileTree,
  },
})
export default class FileManage extends Vue {
  configPath = resolve(
    readFile(userdir).workDir,
    'app_config',
    'file-manage.json'
  );
}
</script>
