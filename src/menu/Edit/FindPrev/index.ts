import { KeyboardEventModule } from '@/store/modules/keyboard-event';

export function findPrev() {
  KeyboardEventModule.keyboardKeypress('shift+f3');
}
