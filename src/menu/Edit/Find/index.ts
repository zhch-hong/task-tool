import { KeyboardEventModule } from '@/store/modules/keyboard-event';

export function find() {
  KeyboardEventModule.keyboardKeypress('ctrl+f');
}
