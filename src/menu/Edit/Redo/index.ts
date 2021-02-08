import { KeyboardEventModule } from '@/store/modules/keyboard-event';

export function redo() {
  KeyboardEventModule.keyboardKeypress('ctrl+y');
}
