import {
  Action,
  getModule,
  Module,
  Mutation,
  VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { dirConfigPath } from '@/asserts/dir-config';
import { readFileText, writeFileText } from '@/utils';

const object: Record<PropertyKey, any> = readFileText(dirConfigPath);

function readDefaultExpanedKeys(): string[] {
  if (typeof object.expandedKeys !== 'undefined') {
    return object.expandedKeys;
  }

  return [];
}

function writeDefaultExpanedKeys(params: string[]) {
  object.expandedKeys = params;

  writeFileText(dirConfigPath, object);
}

@Module({ dynamic: true, store, name: 'fileTree' })
class FileTree extends VuexModule {
  private expandedList = readDefaultExpanedKeys();

  @Mutation
  private APPEND_KEY(key: string): void {
    this.expandedList.push(key);
  }

  @Mutation
  private REMOVE_KEY(key: string): void {
    const index = this.expandedList.findIndex((k) => k === key);

    if (index !== -1) {
      this.expandedList.splice(index, 1);
    }
  }

  @Action
  public appendKey(key: string): void {
    this.APPEND_KEY(key);
    writeDefaultExpanedKeys(this.expandedList);
  }

  @Action
  public removeKey(key: string): void {
    this.REMOVE_KEY(key);
    writeDefaultExpanedKeys(this.expandedList);
  }

  get expandedKeys() {
    return this.expandedList;
  }
}

export const FileTreeModule = getModule(FileTree);
