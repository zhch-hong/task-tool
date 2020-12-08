import path from 'path';
import fs from 'fs';

import store from '@/store';
import { readFile } from '@/utils/fileStream';

const config = readFile(store.state.userStoragePath);
const workDir: string = config.workDir;

const dirPath = path.resolve(workDir, 'app_config');
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

const filemanage = path.resolve(dirPath, `file-manage.json`);
try {
  const stat = fs.statSync(filemanage);
  if (!stat.isFile()) {
    throw new Error(`create file ${filemanage}`);
  }
} catch (error) {
  fs.writeFileSync(filemanage, JSON.stringify([]));
}

const inputmanage = path.resolve(dirPath, `input-manage.json`);
try {
  const stat = fs.statSync(inputmanage);
  if (!stat.isFile()) {
    throw new Error(`create file ${inputmanage}`);
  }
} catch (error) {
  fs.writeFileSync(inputmanage, JSON.stringify([]));
}

const sourcemanage = path.resolve(dirPath, `source-manage.json`);
try {
  const stat = fs.statSync(sourcemanage);
  if (!stat.isFile()) {
    throw new Error(`create file ${sourcemanage}`);
  }
} catch (error) {
  fs.writeFileSync(sourcemanage, JSON.stringify([]));
}
