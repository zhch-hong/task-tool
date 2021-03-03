import store from '..';
import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({ name: 'tableScroll', store, dynamic: true })
class TableScroll extends VuexModule {
  scroll: Record<string, number | boolean> | null = null;

  @Mutation
  SET_SCROLL(scroll: Record<string, number | boolean> | null) {
    this.scroll = scroll;
  }
}

export const TableScrollModule = getModule(TableScroll);
