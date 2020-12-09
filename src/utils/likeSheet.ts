import { Workbook, Worksheet } from 'exceljs';

export function getSheet(
  workbook: Workbook,
  sheetName: string
): Worksheet | undefined {
  let index = -1;
  workbook.eachSheet((sheet, id) => {
    if (sheet.name.split('|')[0] === sheetName) index = id;
  });
  if (index !== -1) return workbook.getWorksheet(index);
}
