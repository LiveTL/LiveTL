'use strict';

import { defaultShortcuts, keyboardShortcuts } from './store.js';
import { clamp } from './utils.js';
import { derived } from 'svelte/store';

export const shortcutMap = derived(keyboardShortcuts, $shorts => {
  const reverseKeyAction = ([key, action]) => [action, key];

  const existingShortcuts = Object.entries($shorts).map(reverseKeyAction);
  const newShortcuts = Object.entries(defaultShortcuts)
    .filter(([_key, action]) => $shorts[action] == null)
    .map(reverseKeyAction);

  return new Map([...existingShortcuts, ...newShortcuts]);
});

export const executeAction = action =>
  document.querySelector('iframe[title=video]')?.contentWindow?.postMessage({
    type: 'shortcut-action',
    action
  });

window.executeAction = executeAction;
