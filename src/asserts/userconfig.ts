import { readFile, writeFile } from '@/utils/fileStream';
import store from '@/store';

export function getUserconfig(): Record<string, any> {
  return readFile(store.state.userStoragePath);
}

export function setUserconfig(data: Record<string, any>) {
  writeFile(store.state.userStoragePath, data);
}
