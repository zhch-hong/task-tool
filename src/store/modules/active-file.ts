import store from '..';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { LostIdModule } from './lost-id';
import { WorkspacedModule } from './workspaced';

@Module({ name: 'activeFile', store, dynamic: true })
class ActiveFile extends VuexModule {
  public path = '';

  @Mutation
  private SET_PATH(path: string): void {
    this.path = path;
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

  get currentPath(): string {
    return this.path;
  }
}

export const ActiveFileModule = getModule(ActiveFile);
