import store from '..';
import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({ name: 'copyTask', store, dynamic: true })
class CopyTask extends VuexModule {
  taskList: Record<string, Record<string, string> | Record<string, string>[]>[] | null = null;

  @Mutation
  SET_TASKLIST(array: Record<string, Record<string, string> | Record<string, string>[]>[] | null) {
    this.taskList = array;
  }
}

export const CopyTaskModule = getModule(CopyTask);
