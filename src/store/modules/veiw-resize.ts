import {
  Action,
  getModule,
  Module,
  Mutation,
  VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';

@Module({ dynamic: true, store, name: 'viewResize' })
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
