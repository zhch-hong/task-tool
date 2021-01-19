import { resolve } from 'path';
import { userInfo } from 'os';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { remote } from 'electron';

const { app, dialog } = remote;

const dirConfigPath = resolve(
  app.getPath('userData'),
  `${userInfo().username}_config.json`
);

let workDir = '';
let configDir = '';

export function setWorkDir(path?: string): string {
  const response = dialog.showOpenDialogSync({
    title: '请选择工作目录',
    buttonLabel: '设为工作目录',
    defaultPath: path,
    properties: ['openDirectory'],
  });

  if (typeof response === 'undefined') {
    return setWorkDir();
  } else {
    return response[0];
  }
}

export function setConfigDir(path?: string): string {
  const response = dialog.showOpenDialogSync({
    title: '请选择配置存储路径',
    properties: ['openDirectory'],
    defaultPath: path,
  });

  if (typeof response === 'undefined') {
    return setConfigDir();
  } else {
    return response[0];
  }
}

if (!existsSync(dirConfigPath)) {
  workDir = setWorkDir();
  configDir = setConfigDir(workDir);

  writeFileSync(
    dirConfigPath,
    JSON.stringify({
      workDir,
      configDir,
    })
  );
} else {
  const config: Record<string, string> = JSON.parse(
    readFileSync(dirConfigPath).toString()
  );

  if (!config.workDir) {
    workDir = setWorkDir();
  }

  if (!config.configDir) {
    configDir = setConfigDir();
  }

  if (config.workDir && config.configDir) {
    workDir = config.workDir;
    configDir = config.configDir;
  } else {
    config.workDir = workDir;
    config.configDir = configDir;

    writeFileSync(dirConfigPath, Buffer.from(JSON.stringify(config)));
  }
}

export { workDir, configDir, dirConfigPath };
