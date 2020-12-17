import { Worksheet } from 'exceljs';

export function getRowMap(ws: Worksheet, col: string, value: string) {
  const rowData: Record<string, any> = {};

  const object = {
    row: rowData,
    rowNumber: -1,
  };

  const column = ws.columns.find((column) => column.key === col);

  if (column) {
    try {
      column.eachCell((cell, rowNumber) => {
        if (cell.text === value) {
          object.rowNumber = rowNumber;
          throw new Error();
        }
      });
    } catch (error) {
      // 返回匹配的第一个，跳出循环
    }
  }

  if (object.rowNumber !== -1) {
    const row = ws.getRow(object.rowNumber);
    if (row) {
      const keys = ws.columns
        .filter((column) => column.key)
        .map((column) => column.key);

      row.eachCell((cell, colNumber) => {
        const key = keys[colNumber - 1];

        if (key) {
          object.row[key] = cell.text;
        }
      });
    }
  }

  return object;
}
