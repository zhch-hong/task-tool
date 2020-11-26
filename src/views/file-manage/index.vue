<template>
  <h1>文件管理</h1>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { readdirSync } from 'fs';

const dirPath = 'D:\\JyQipai_doc';

@Component
export default class FileManage extends Vue {
  created(): void {
    const dir = readdirSync(dirPath);
    console.log(dir);
  }
}
</script>
