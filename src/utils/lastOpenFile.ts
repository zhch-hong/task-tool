import store from '@/electron-store';
import { ActiveFileModule } from '@/store/modules/active-file';

export function readLastFile(): Promise<string> {
  const lastOpenFile = store.get('lastOpenFile') as string | undefined;

  if (!lastOpenFile) {
    return Promise.reject();
  }

  ActiveFileModule.SetPath(lastOpenFile);

  return Promise.resolve(lastOpenFile);
}
