<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button type="button" v-on:click="dialog">dialog</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { remote } from 'electron';
import XLSX from 'xlsx';

const { dialog } = remote;

@Component
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;

  async dialog(): Promise<void> {
    const open = await dialog.showOpenDialog({ properties: ['openFile'] });
    const path = open.filePaths[0];
    const workBook = XLSX.readFile(path, { type: 'binary' });
    console.log(workBook);
    // ipcRenderer.invoke('file-path', path);
    // const save = await dialog.showSaveDialog({});
    // if (save.filePath) {
    //   XLSX.writeFile(read, save.filePath);
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
