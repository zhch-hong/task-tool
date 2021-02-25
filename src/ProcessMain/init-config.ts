import path from 'path';
import fs from 'fs';
import Electron from 'electron';
import store from '@/electron-store';

function setWorkDir(defaultPath?: string): string | undefined {
  const response = Electron.dialog.showOpenDialogSync({
    title: '请选择工作目录',
    buttonLabel: '设为工作目录',
    defaultPath: defaultPath,
    properties: ['openDirectory'],
  });

  if (typeof response !== 'undefined') {
    return response[0];
  }
}

function setConfigDir(defaultPath?: string): string | undefined {
  const response = Electron.dialog.showOpenDialogSync({
    title: '请选择配置存储路径',
    properties: ['openDirectory'],
    defaultPath: defaultPath,
  });

  if (typeof response !== 'undefined') {
    return response[0];
  }
}

function initFile() {
  // 工作目录
  const workDir = store.get('workDir');
  if (!workDir) {
    const dir = setWorkDir();
    if (!dir) Electron.app.quit();
    else store.set('workDir', dir);
  }

  // 配置文件存储目录
  const configDir = store.get('configDir');
  if (!configDir) {
    const dir = setConfigDir(store.get('workDir') as string);
    if (!dir) {
      store.set('configDir', store.get('workDir'));
    } else {
      store.set('configDir', dir);
    }
  }

  const dirPath = path.resolve(store.get('configDir') as string, 'app_config');

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
}

export { initFile, setWorkDir, setConfigDir };
