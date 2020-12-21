import { Workbook, Worksheet } from 'exceljs';
import { Notification } from 'element-ui';
import { SheetName } from '@/shims-cust';

export function getSheet(
  workbook: Workbook,
  sheetName: SheetName
): Worksheet | undefined {
  let index = -1;
  workbook.eachSheet((sheet, id) => {
    if (sheet.name.split('|')[0] === sheetName) index = id;
  });
  if (index !== -1) {
    return workbook.getWorksheet(index);
  } else {
    Notification({
      title: `获取${sheetName}工作表失败`,
      message: `工作簿中不存在${sheetName}工作表，请检查Excel文件`,
      type: 'error',
      position: 'bottom-right',
    });
  }
}
