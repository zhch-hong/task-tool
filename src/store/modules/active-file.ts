import {
  Action,
  getModule,
  Module,
  Mutation,
  VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { LostIdModule } from './lost-id';
import { WorkspacedModule } from './workspaced';

@Module({ dynamic: true, store, name: 'activeFile' })
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
}

export const ActiveFileModule = getModule(ActiveFile);
