<template>
  <div>
    <el-button @click="visible = true">dialog</el-button>
    <el-dialog :visible.sync="visible"></el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class About extends Vue {
  visible = false;
}
</script>
