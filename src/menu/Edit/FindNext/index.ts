import { KeyboardEventModule } from '@/store/modules/keyboard-event';

export function findNext() {
  KeyboardEventModule.keyboardKeypress('f3');
}
