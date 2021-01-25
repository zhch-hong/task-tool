<template>
  <el-dialog
    :visible.sync="visiblesync"
    :close-on-click-modal="false"
    title="关于"
  >
  </el-dialog>
</template>
<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator';
import { remote } from 'electron';

const { app } = remote;

@Component
export default class Options extends Vue {
  @PropSync('visible', { type: Boolean, default: false }) visiblesync!: boolean;

  version = '';

  created(): void {
    this.version = app.getVersion();
  }
}
</script>
