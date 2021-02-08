import router from '@/router';
import { KeyboardEventModule } from '@/store/modules/keyboard-event';

export function createTask() {
  if (router.currentRoute.path !== '/edit-file') return;

  KeyboardEventModule.keyboardKeypress('ctrl+n');
}
