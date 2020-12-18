import { userdir } from '@/asserts/userdir';
import { readFileText, writeFileText } from '@/utils/fileSystem';

export function getUserconfig(): Record<string, any> {
  return readFileText(userdir);
}

export function setUserconfig(data: Record<string, any>) {
  writeFileText(userdir, data);
}
