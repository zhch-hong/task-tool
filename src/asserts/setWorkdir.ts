import { userdir } from '@/asserts/userdir';
import { readFile, writeFile } from '@/utils/fileStream';
import { remote } from 'electron';

const { dialog } = remote;
const config = readFile(userdir);

function getWorkdir(): string {
  const path = dialog.showOpenDialogSync({
    title: '工作目录',
    properties: ['openDirectory'],
  });
  if (!path) return getWorkdir();
  return path[0];
}

if (!config.workDir) {
  config.workDir = getWorkdir();
}

writeFile(userdir, config);

export { userdir };
