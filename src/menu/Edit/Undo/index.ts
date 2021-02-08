import { KeyboardEventModule } from '@/store/modules/keyboard-event';

export function undo() {
  KeyboardEventModule.keyboardKeypress('ctrl+z');
}
