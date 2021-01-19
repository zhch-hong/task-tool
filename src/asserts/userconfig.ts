import { dirConfigPath } from '@/asserts/dir-config';
import { readFileText, writeFileText } from '@/utils/fileSystem';

export function getUserconfig(): Record<string, any> {
  return readFileText(dirConfigPath);
}

export function setUserconfig(data: Record<string, any>) {
  writeFileText(dirConfigPath, data);
}
