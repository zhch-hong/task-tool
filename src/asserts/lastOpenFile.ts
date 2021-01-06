import store from '@/store';
import { getUserconfig } from '@/asserts/userconfig';
import { ActiveFileModule } from '@/store/modules/active-file';

export function readLastFile() {
  // 从配置文件读取最后一次打开的文件
  const object: Record<string, string> = getUserconfig();
  const { lastOpenFile } = object;
  ActiveFileModule.SetPath(lastOpenFile);

  return Promise.resolve(lastOpenFile);
}
