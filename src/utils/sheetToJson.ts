import { Row, Worksheet } from 'exceljs';

export function sheetToJson(worksheet: Worksheet) {
  const dataArray: Record<string, string>[] = [];
  let keys: string[] = [];
  worksheet.eachRow(function (row, rowNumber) {
    if (rowNumber == 1) {
      if (!Array.isArray(row)) {
        keys = row.values as string[];
      }
    } else {
      const rowDict = cellValueToDict(keys, row);
      dataArray.push(rowDict);
    }
  });
  return dataArray;
}

function cellValueToDict(keys: string[], row: Row) {
  const data: Record<string, any> = {};
  row.eachCell((cell, colNumber) => {
    const value = cell.toString();
    const _key = keys[colNumber].split('|');
    const k = _key[0] || _key[1];
    data[k] = value;
  });
  return data;
}
