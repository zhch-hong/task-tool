import store from '..';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({ name: 'viewResize', store, dynamic: true })
class ViewResize extends VuexModule {
  public windowHeight = 800;

  @Mutation
  RESET_WINDOW_HEIGHT(): void {
    this.windowHeight = window.innerHeight;
  }

  @Action
  resetWindowHeight(): void {
    this.RESET_WINDOW_HEIGHT();
  }
}

export const ViewResizeModule = getModule(ViewResize);
