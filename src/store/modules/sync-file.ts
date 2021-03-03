import store from '..';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({ name: 'syncFile', store, dynamic: true })
class SyncFile extends VuexModule {
  private _fileName: null | string = null;
  private _pathList: string[] = [];

  @Mutation
  private SET_FILE_NAME(name: string): void {
    this._fileName = name;
  }

  @Mutation
  private SET_PATH_LIST(pathList: string[]): void {
    this._pathList = pathList;
  }

  @Action
  public setFileName(name: string): void {
    this.SET_FILE_NAME(name);
  }

  @Action
  public setPathList(pathList: string[]): void {
    this.SET_PATH_LIST(pathList);
  }

  get fileName() {
    return this._fileName;
  }

  get pathList() {
    return this._pathList;
  }
}

export const SyncFileModule = getModule(SyncFile);
