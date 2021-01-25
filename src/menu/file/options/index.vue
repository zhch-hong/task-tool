<template>
  <el-dialog
    :visible.sync="visiblesync"
    :close-on-click-modal="false"
    title="选项"
  >
    <StorageDir />
    <WorkDir />
  </el-dialog>
</template>
<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator';
import StorageDir from './components/StorageDir.vue';
import WorkDir from './components/WorkDir.vue';

@Component({
  components: { StorageDir, WorkDir },
})
export default class Options extends Vue {
  @PropSync('visible', { type: Boolean, default: false }) visiblesync!: boolean;
}
</script>
