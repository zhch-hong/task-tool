<template>
  <div>
    <ConfigTable :config-path="configPath" />
  </div>
</template>
<script lang="ts">
import { resolve } from 'path';
import { Component, Vue } from 'vue-property-decorator';

import store from '@/electron-store';

import ConfigTable from './components/ConfigTable.vue';

@Component({
  components: {
    ConfigTable,
  },
})
export default class FileManage extends Vue {
  configPath = resolve(store.get('configDir') as string, 'app_config', 'file-manage.json');
}
</script>
