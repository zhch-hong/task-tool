import store from '@/store';
import { writeFileSync } from 'fs';
import { CellValue, Workbook, Worksheet } from 'exceljs';

import { sheetToJson } from '@/utils/sheetToJson';
import { writeFile } from '@/utils/fileStream';

const path = store.state.taskFilePath;
const workbook = store.state.workbook as Workbook;

export function writeExcel(data: Record<string, any>) {
  const base: Record<string, any> = data.base;
  const progress: Record<string, any> = data.progress;
  const source: Record<string, any>[] = data.source;
  console.log(base);
  console.log(progress);
  console.log(source);

  writeBase(base);
}

function writeBase(data: Record<string, any>) {
  const ws = workbook.getWorksheet('task');
  const rowData = getRowByColumnValue(ws, 'id', data.id);
  const row = rowData.rowData as Record<string, CellValue>;
  console.log(JSON.parse(JSON.stringify(row)));
  const rowNumber = rowData.rowNumber as number;
  row['任务内容说明'] = data.desc;
  delete data.desc;
  Object.assign(row, data);

  if (
    typeof row.start_valid_time === 'string' &&
    typeof row.end_valid_time === 'string'
  ) {
    row.start_valid_time = parseInt(row.start_valid_time) * 1000;
    row.end_valid_time = parseInt(row.end_valid_time) * 1000;
  }

  console.log(JSON.parse(JSON.stringify(row)));
  ws.spliceRows(rowNumber, 1);
  ws.insertRow(rowNumber, row);
  workbook.xlsx.writeBuffer().then((buffer) => {
    writeFileSync(path, new Uint8Array(buffer));
  });
}

function getRowByColumnValue(
  ws: Worksheet,
  col: string,
  value: string
): Record<string, Record<string, CellValue> | number> {
  const object: Record<string, Record<string, CellValue> | number> = {};
  const rowData: Record<string, CellValue> = {};
  ws.eachRow((row, index) => {
    const cell = row.getCell(col);
    if (cell.toString() === value) {
      object['rowNumber'] = index;
      const row = ws.getRow(index);
      row.eachCell((cell, colNumber) => {
        const key = cell.worksheet.getColumn(colNumber).key;
        if (key) {
          rowData[key] = cell.value;
        }
      });
    }
  });
  object['rowData'] = rowData;
  return object;
}
