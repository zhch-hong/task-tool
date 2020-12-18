import { userdir } from '@/asserts/userdir';
import { readFileText, writeFileText } from '@/utils/fileSystem';
import { remote } from 'electron';

const { dialog } = remote;
const config = readFileText(userdir);

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

writeFileText(userdir, config);

export { userdir };
