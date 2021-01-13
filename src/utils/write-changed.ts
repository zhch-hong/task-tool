import { ChangedMapModule } from '@/store/modules/changed-map';
import { writeMapToExcel } from './xlsxIO';

let timer: NodeJS.Timeout | null = null;

export function writeChanged(time = 5000): Promise<void> {
  return new Promise<void>((resolve) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const promises: Promise<void>[] = [];
      console.log(ChangedMapModule.changedMap);

      ChangedMapModule.changedMap.forEach((value, key) =>
        promises.push(writeMapToExcel(value, key))
      );
      Promise.all(promises)
        .then(() => {
          timer = null;
          resolve();
        })
        .catch(() => {
          writeChanged();
        });
    }, time);
  });
}
