<template>
  <div>
    <ConfigTable :config-path="configPath" />
  </div>
</template>
<script lang="ts">
import { resolve } from 'path';
import { Component, Vue } from 'vue-property-decorator';

import ConfigTable from './components/ConfigTable.vue';

import { configDir } from '@/asserts/dir-config';

@Component({
  components: {
    ConfigTable,
  },
})
export default class FileManage extends Vue {
  configPath = resolve(configDir, 'app_config', 'file-manage.json');
}
</script>
