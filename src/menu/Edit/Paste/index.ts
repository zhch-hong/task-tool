import router from '@/router';
import { KeyboardEventModule } from '@/store/modules/keyboard-event';

export function pasteTask() {
  if (router.currentRoute.path !== '/edit-file') return;

  KeyboardEventModule.keyboardKeypress('ctrl+v');
}
