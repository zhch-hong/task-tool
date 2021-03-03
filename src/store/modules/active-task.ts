import store from '..';
import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({ name: 'activeTask', store, dynamic: true })
class ActiveTask extends VuexModule {
  taskId = '';

  @Mutation
  SET_TASKID(id: string) {
    this.taskId = id;
  }
}

export const ActiveTaskModule = getModule(ActiveTask);
