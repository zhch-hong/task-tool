<template>
  <el-button v-on:click="dialog">electron</el-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { remote } from 'electron';
import XLSX from 'xlsx';

const { dialog } = remote;

@Component
export default class Home extends Vue {
  async dialog(): Promise<void> {
    const open = await dialog.showOpenDialog({ properties: ['openFile'] });
    const path = open.filePaths[0];
    const workbook = XLSX.readFile(path, { type: 'binary' });

    var ws = XLSX.utils.json_to_sheet(
      [
        { A: 'S', B: 'h', C: 'e', D: 'e', E: 't', F: 'J', G: 'S' },
        { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7 },
        { A: 2, B: 3, C: 4, D: 5, E: 6, F: 7, G: 8 },
      ],
      { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skipHeader: true }
    );
    XLSX.utils.book_append_sheet(workbook, ws, 'xxx--');
    XLSX.writeFile(workbook, path, { type: 'binary' });

    /* var ws_name = 'SheetJS';
    var ws_data = [
      ['S', 'h', 'e', 'e', 't', 'J', 'S'],
      [1, 2, 3, 4, 5],
    ];
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(workbook, ws, ws_name);
    XLSX.writeFile(workbook, path, { type: 'binary' }); */

    // 读单元格
    // const first_sheet_name = workbook.SheetNames[0];
    // var address_of_cell = 'A1';
    // var worksheet = workbook.Sheets[first_sheet_name];
    // var range = XLSX.utils.decode_range(worksheet['!ref'] as string);
    // var ncols = range.e.c - range.s.c + 1,
    //   nrows = range.e.r - range.s.r + 1;
    // console.log(ncols, nrows);
    // var desired_cell = worksheet[address_of_cell];
    // console.log(desired_cell);
  }
}
</script>
