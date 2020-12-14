import path from 'path';
import fs from 'fs';

import { userdir } from '@/asserts/setWorkdir';
import { readFile } from '@/utils/fileStream';

const config = readFile(userdir);
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
  fs.writeFileSync(
    inputmanage,
    JSON.stringify([
      {
        value: 'type',
        name: '任务获得类型',
        select: [],
      },
      {
        value: 'enum',
        name: '任务枚举类型',
        select: [],
      },
      {
        value: 'asset',
        name: '财富类型',
        select: [],
      },
    ])
  );
}

const sourcemanage = path.resolve(dirPath, `source-manage.json`);
try {
  const stat = fs.statSync(sourcemanage);
  if (!stat.isFile()) {
    throw new Error(`create file ${sourcemanage}`);
  }
} catch (error) {
  fs.writeFileSync(
    sourcemanage,
    JSON.stringify([
      {
        id: 'root',
        label: 'Root',
        children: [],
      },
    ])
  );
}

const templatemanage = path.resolve(dirPath, `template-manage.json`);
try {
  const stat = fs.statSync(templatemanage);
  if (!stat.isFile()) {
    throw new Error(`create file ${templatemanage}`);
  }
} catch (error) {
  fs.writeFileSync(
    templatemanage,
    JSON.stringify({
      base: [],
      process: [],
      source: [],
    })
  );
}
