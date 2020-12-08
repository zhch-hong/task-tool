import { readFile, writeFile } from '@/utils/fileStream';
import { userdir } from '@/asserts/userdir';

export function getUserconfig(): Record<string, any> {
  return readFile(userdir);
}

export function setUserconfig(data: Record<string, any>) {
  writeFile(userdir, data);
}
