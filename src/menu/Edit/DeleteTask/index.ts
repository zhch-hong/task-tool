import router from '@/router';
import { KeyboardEventModule } from '@/store/modules/keyboard-event';

export function deleteTask() {
  if (router.currentRoute.path !== '/edit-file') return;

  KeyboardEventModule.keyboardKeypress('ctrl+r');
}
