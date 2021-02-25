import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import ElectronStore from '@/electron-store';
import { readFileText, writeFileText } from '@/utils';

function readDefaultExpanedKeys(): string[] {
  const expandedKeys = ElectronStore.get('expandedKeys') as string[];
  if (typeof expandedKeys !== 'undefined') {
    return expandedKeys;
  }

  return [];
}

function writeDefaultExpanedKeys(params: string[]) {
  ElectronStore.set('expandedKeys', params);
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
