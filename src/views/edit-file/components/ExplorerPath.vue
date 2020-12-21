<template>
  <span class="explorer-path" :title="path" @click="linkExplorer($event)">{{
    explorerpath
  }}</span>
</template>
<script lang="ts">
import store from '@/store';
import { Component, Vue } from 'vue-property-decorator';
import { shell } from 'electron';

import { userConfig } from '@/asserts/userconfig';

@Component
export default class ExplorerPath extends Vue {
  get path(): string {
    return store.state.taskFilePath;
  }

  get explorerpath(): string {
    return this.path.slice(userConfig.workDir.length + 1);
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
