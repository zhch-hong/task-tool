import {
  Action,
  getModule,
  Module,
  Mutation,
  VuexModule,
} from 'vuex-module-decorators';
import { CombinedVueInstance } from 'vue/types/vue';
import store from '@/store';

@Module({ dynamic: true, store, name: 'componentInstance' })
class ComponentInstance extends VuexModule {
  private readonly instanceMap: Map<PropertyKey, any> = new Map();

  @Mutation
  private ADD_INSTANCE(payload: { name: string; ins: any }): void {
    const { name, ins } = payload;
    this.instanceMap.set(name, ins);
  }

  @Action
  public addInstance(payload: { name: string; ins: any }): void {
    this.ADD_INSTANCE(payload);
  }

  get instance() {
    return (name: string) => {
      return this.instanceMap.get(name);
    };
  }
}

export const ComponentInstanceModule = getModule(ComponentInstance);
