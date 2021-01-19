import { ChangedMapModule } from '@/store/modules/changed-map';
import { writeMapToExcel } from './xlsxIO';
import { Notification } from 'element-ui';

let timer: NodeJS.Timeout | null = null;

export function writeChanged(time = 1000): Promise<void> {
  return new Promise<void>((resolve) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const promises: Promise<void>[] = [];

      ChangedMapModule.changedMap.forEach((value, key) =>
        promises.push(writeMapToExcel(value, key))
      );
      Promise.all(promises)
        .then(() => {
          timer = null;
          resolve();
          Notification({
            message: '写入文件成功',
            type: 'success',
            title: '',
            duration: 1000,
            position: 'bottom-right',
          });
        })
        .catch(() => {
          writeChanged();
        });
    }, time);
  });
}
