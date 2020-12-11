import { Workbook } from 'exceljs';

export function setColumnKey(workbook: Workbook) {
  const wb = workbook;
  wb.eachSheet((ws) => {
    ws.getRow(1).eachCell((cell, index) => {
      const head = cell.toString();
      const key = head.split('|')[0];
      const name = head.split('|')[1];
      if (key || name) {
        const column = ws.getColumn(index);
        column.key = key || name;
      }
    });
  });
}
