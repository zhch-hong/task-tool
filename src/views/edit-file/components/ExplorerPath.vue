<template>
  <span class="explorer-path" :title="path" @click="linkExplorer($event)">{{ explorerpath }}</span>
</template>
<script lang="ts">
import store from '@/electron-store';
import { Component, Vue } from 'vue-property-decorator';
import { shell } from 'electron';

import { ActiveFileModule } from '@/store/modules/active-file';

@Component
export default class ExplorerPath extends Vue {
  get path(): string {
    return ActiveFileModule.path;
  }

  get explorerpath(): string {
    return this.path.slice((store.get('workDir') as string).length + 1);
  }

  linkExplorer(event: MouseEvent): void {
    if (event.ctrlKey) shell.openExternal(this.path);
    else shell.showItemInFolder(this.path);
  }
}
</script>
<style lang="scss" scoped>
.explorer-path {
  margin-left: 20px;
  cursor: pointer;
  color: #80ccff;
  &:hover {
    text-decoration-line: underline;
  }
}
</style>
