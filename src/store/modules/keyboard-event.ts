import store from '..';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({ name: 'keyboardEvent', store, dynamic: true })
class KeyboardEvent extends VuexModule {
  private keyMaps: Map<string, Array<() => void>> = new Map();

  @Mutation
  private REGISTER_KEYBOARD(payload: { key: string; handles: Array<() => void> }): void {
    const handleList = this.keyMaps.get(payload.key);
    if (handleList) handleList.push(...payload.handles);
    else this.keyMaps.set(payload.key, [...payload.handles]);
  }

  @Mutation
  private UNREGISTER_KEYBOARD(key: string): void {
    this.keyMaps.delete(key);
  }

  @Mutation
  private KEYBOARD_KEYPRESS(key: string): void {
    const handleList = this.keyMaps.get(key);
    if (handleList) {
      handleList.forEach((fun) => fun());
    }
  }

  @Action({ rawError: true })
  public registerKeyboard(payload: { key: string; handles: Array<() => void> }): void {
    this.REGISTER_KEYBOARD(payload);
  }

  @Action
  public unregisterKeyboard(key: string): void {
    this.UNREGISTER_KEYBOARD(key);
  }

  @Action
  public keyboardKeypress(key: string): void {
    this.KEYBOARD_KEYPRESS(key);
  }
}

export const KeyboardEventModule = getModule(KeyboardEvent);
