import store from '..';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import ElectronStore from '@/electron-store';

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

@Module({ name: 'expandedKeys', store, dynamic: true })
class ExpandedKeys extends VuexModule {
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

export const ExpandedKeysModule = getModule(ExpandedKeys);
