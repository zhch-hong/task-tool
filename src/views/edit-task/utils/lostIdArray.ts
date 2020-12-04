import store from '@/store';
import { Notification } from 'element-ui';

export function lostIdArray(sheetName: string, key: string): () => number {
  const workbook = store.state.workbook;
  if (!workbook) {
    Notification({
      title: '获取工作簿失败',
      message: 'vuex中不存在workbook',
      type: 'error',
      position: 'bottom-right',
    });
    throw new Error('vuex中不存在workbook');
  }

  const sheet = workbook.getWorksheet(sheetName);
  let existing: number[] = [];

  const cellTextList: string[] = [];
  sheet.getColumn(key).eachCell((cell) => {
    cellTextList.push(cell.text);
  });
  cellTextList.shift();
  cellTextList.forEach((text) => {
    if (text) existing.push(parseInt(text));
  });

  existing = [...new Set(existing)];
  existing.sort((a, b) => a - b);

  let maxId = existing[existing.length - 1];

  const lostIdArray: number[] = [];
  let length = lostIdArray.length;
  existing.forEach((v, i) => {
    length = lostIdArray.length;
    while (v - (i + length) > 1) {
      length = lostIdArray.push(i + length + 1);
    }
  });

  return (): number => {
    return lostIdArray.shift() || ++maxId;
  };
}
