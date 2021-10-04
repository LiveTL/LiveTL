'use strict';

import { keydownToShortcut, toggleFullScreen } from './utils.js';
import { defaultShortcuts, keyboardShortcuts, videoShortcutAction } from './store.js';
import { derived, get } from 'svelte/store';

// key -> shortcut
export const shortcutMap = derived(keyboardShortcuts, $shorts => {
  const reverseKeyAction = ([action, key]) => [key, action];

  const savedShortcuts = Object.entries($shorts).map(reverseKeyAction);
  // shortcuts that were added in update but aren't in storage yet
  const newShortcuts = Object.entries(defaultShortcuts)
    .filter(([_key, action]) => $shorts[action] == null)
    .map(reverseKeyAction);

  return new Map([...newShortcuts, ...savedShortcuts]);
});

const focussedOnInput = () => document.activeElement.tagName !== 'BODY';

export const executeAction = action => action === 'fullScreen'
  ? toggleFullScreen()
  : videoShortcutAction.set(action);

export const onKeyEvent = e => {
  const keys = keydownToShortcut(e);
  if (focussedOnInput() || !get(shortcutMap).has(keys)) return;
  e.preventDefault();
  executeAction(get(shortcutMap).get(keys));
};
