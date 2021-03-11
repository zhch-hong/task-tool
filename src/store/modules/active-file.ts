import store from '..';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { LostIdModule } from './lost-id';
import { WorkspacedModule } from './workspaced';

@Module({ name: 'activeFile', store, dynamic: true })
class ActiveFile extends VuexModule {
  private _path = '';

  /**
   * 当文件中的任务被修改时，会触发_updateCount改变，通过监听这个变量，来更新视图
   */
  private _updateCount = 0;

  @Mutation
  private SET_PATH(path: string): void {
    this._path = path;
    // 当打开新的文件时，将文件更新标识重置
    this._updateCount = 0;
  }

  @Action
  public SetPath(path: string): void {
    this.SET_PATH(path);
    WorkspacedModule.bookMapByPath(path)
      .then((map) => {
        LostIdModule.setLostId(map);
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  @Mutation
  private UPDATE_COUNT(): void {
    this._updateCount++;
  }

  @Action
  public UpdateCount(): void {
    this.UPDATE_COUNT();
  }

  get path(): string {
    return this._path;
  }

  get updateCount(): number {
    return this._updateCount;
  }
}

export const ActiveFileModule = getModule(ActiveFile);
