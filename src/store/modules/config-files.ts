import store from '..';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import ElectronStore from '@/electron-store';
import { readFileText } from '@/utils';

const BASE_PATH = path.resolve(ElectronStore.get('configDir') as string, 'app_config');
const FILE_PATH = path.resolve(BASE_PATH, 'file-manage.json');
const INPUT_PATH = path.resolve(BASE_PATH, 'input-manage.json');
const SOURCE_PATH = path.resolve(BASE_PATH, 'source-manage.json');
const TEMPLATE_PATH = path.resolve(BASE_PATH, 'template-manage.json');

@Module({ name: 'configFiles', store, dynamic: true })
class ConfigFiles extends VuexModule {
  private _fileData: Array<Record<string, string>> = readFileText(FILE_PATH);
  private _inputData: Array<Record<string, any>> = readFileText(INPUT_PATH);
  private _sourceData: Array<Record<string, any>> = readFileText(SOURCE_PATH);
  private _templateData: Record<string, Array<Record<string, any>>> = readFileText(TEMPLATE_PATH);

  private _fileListener: Map<string, (data: Array<Record<string, string>>) => void> = new Map();
  private _inputListener: Map<string, (data: Array<Record<string, any>>) => void> = new Map();
  private _sourceListener: Map<string, (data: Array<Record<string, any>>) => void> = new Map();
  private _templateListener: Map<string, (data: Record<string, Array<Record<string, any>>>) => void> = new Map();

  @Mutation
  SET_FILEDATA(data: Array<Record<string, string>>) {
    this._fileData = data;
    this._fileListener.forEach((cb) => cb(data));
  }

  @Mutation
  SET_INPUTDATA(data: Array<Record<string, any>>) {
    this._inputData = data;
    this._inputListener.forEach((cb) => cb(data));
  }

  @Mutation
  SET_SOURCEDATA(data: Array<Record<string, any>>) {
    this._sourceData = data;
    this._sourceListener.forEach((cb) => cb(data));
  }

  @Mutation
  SET_TEMPLATEDATA(data: Record<string, Array<Record<string, any>>>) {
    this._templateData = data;
    this._templateListener.forEach((cb) => cb(data));
  }

  @Mutation
  SET_FILELISTENER(cb: (data: Array<Record<string, string>>) => void) {
    const key = uuid();
    this._fileListener.set(key, cb);
    return key;
  }

  @Mutation
  SET_INPUTLISTENER(cb: (data: Array<Record<string, any>>) => void) {
    const key = uuid();
    this._inputListener.set(key, cb);
    return key;
  }

  @Mutation
  SET_SOURCELISTENER(cb: (data: Array<Record<string, any>>) => void) {
    const key = uuid();
    this._sourceListener.set(key, cb);
    return key;
  }

  @Mutation
  SET_TEMPLATELISTENER(cb: (data: Record<string, Array<Record<string, any>>>) => void) {
    const key = uuid();
    this._templateListener.set(key, cb);
    return key;
  }

  @Mutation
  DEL_FILELISTENER(key: string) {
    this._fileListener.delete(key);
  }

  @Mutation
  DEL_INPUTLISTENER(key: string) {
    this._inputListener.delete(key);
  }

  @Mutation
  DEL_SOURCELISTENER(key: string) {
    this._sourceListener.delete(key);
  }

  @Mutation
  DEL_TEMPLATELISTENER(key: string) {
    this._templateListener.delete(key);
  }

  get fileData() {
    return this._fileData;
  }

  get inputData() {
    return this._inputData;
  }

  get sourceData() {
    return this._sourceData;
  }

  get templateData() {
    return this._templateData;
  }
}

const ConfigFilesModule = getModule(ConfigFiles);

fs.watch(FILE_PATH, (eventType, filename) => {
  if (eventType === 'change') {
    ConfigFilesModule.SET_FILEDATA(readFileText(FILE_PATH));
  }

  if (eventType === 'rename') {
    if (fs.existsSync(filename)) {
      ConfigFilesModule.SET_FILEDATA(readFileText(FILE_PATH));
    } else {
      ConfigFilesModule.SET_FILEDATA([]);
    }
  }
});

fs.watch(INPUT_PATH, (eventType, filename) => {
  if (eventType === 'change') {
    ConfigFilesModule.SET_INPUTDATA(readFileText(INPUT_PATH));
  }

  if (eventType === 'rename') {
    if (fs.existsSync(filename)) {
      ConfigFilesModule.SET_INPUTDATA(readFileText(INPUT_PATH));
    } else {
      ConfigFilesModule.SET_INPUTDATA([]);
    }
  }
});

fs.watch(SOURCE_PATH, (eventType, filename) => {
  if (eventType === 'change') {
    ConfigFilesModule.SET_SOURCEDATA(readFileText(SOURCE_PATH));
  }

  if (eventType === 'rename') {
    if (fs.existsSync(filename)) {
      ConfigFilesModule.SET_SOURCEDATA(readFileText(SOURCE_PATH));
    } else {
      ConfigFilesModule.SET_SOURCEDATA([]);
    }
  }
});

fs.watch(TEMPLATE_PATH, (eventType, filename) => {
  if (eventType === 'change') {
    ConfigFilesModule.SET_TEMPLATEDATA(readFileText(TEMPLATE_PATH));
  }

  if (eventType === 'rename') {
    if (fs.existsSync(filename)) {
      ConfigFilesModule.SET_TEMPLATEDATA(readFileText(TEMPLATE_PATH));
    } else {
      ConfigFilesModule.SET_TEMPLATEDATA({});
    }
  }
});

export { ConfigFilesModule };
export { FILE_PATH, INPUT_PATH, SOURCE_PATH, TEMPLATE_PATH };
