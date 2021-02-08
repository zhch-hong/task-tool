import router from '@/router';
import { KeyboardEventModule } from '@/store/modules/keyboard-event';

export function doubleTask() {
  if (router.currentRoute.path !== '/edit-file') return;

  KeyboardEventModule.keyboardKeypress('ctrl+d');
}
