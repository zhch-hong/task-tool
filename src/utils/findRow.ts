import { CellValue, Worksheet } from 'exceljs';

export function getRowByColumnValue(ws: Worksheet, col: string, value: string) {
  const rowData: Record<string, CellValue> = {};
  const object = {
    row: rowData,
    rowNumber: -1,
  };
  ws.eachRow((row, index) => {
    const cell = row.getCell(col);
    if (cell.text === value) {
      object.rowNumber = index;
      const row = ws.getRow(index);
      row.eachCell((cell, colNumber) => {
        const key = cell.worksheet.getColumn(colNumber).key;
        if (key) {
          rowData[key] = cell.text;
        }
      });
    }
  });

  return object;
}

export function getColRowByColumnValue(
  ws: Worksheet,
  col: string,
  value: string
) {
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
