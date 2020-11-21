<template>
  <el-button v-on:click="dialog">electron</el-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { remote } from 'electron';
import { Workbook } from 'exceljs';
import fs from 'fs';

const { dialog } = remote;

@Component
export default class Home extends Vue {
  async dialog(): Promise<void> {
    const open = await dialog.showOpenDialog({ properties: ['openFile'] });
    const path = open.filePaths[0];

    const wb = new Workbook();

    fs.promises.readFile(path).then((data) => {
      wb.xlsx
        .load(data.buffer)
        .then((res) => {
          const ws = res.getWorksheet('main');
          ws.addRow(['周城弘']);

          ws.eachRow((row, index) => {
            console.log(row.values);
          });

          res.xlsx.writeBuffer().then((buf) => {
            fs.promises.writeFile(path, new Uint8Array(buf));
          });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
}
</script>
