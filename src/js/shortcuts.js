import { defaultShortcuts, keyboardShortcuts } from './store.js';
import derived from 'svelte/store';

export const shortcutMap = derived(keyboardShortcuts, $shorts => {
  const reverseKeyAction = ([key, action]) => [action, key];

  const existingShortcuts = Object.entries($shorts).map(reverseKeyAction);
  const newShortcuts = Object.entries(defaultShortcuts)
    .filter(([_key, action]) => $shorts[action] == null)
    .map(reverseKeyAction);

  return new Map([...existingShortcuts, ...newShortcuts]);
});

export const actionMap = new Map([
  ['volumeUp', player => {
    // TODO
  }],
  ['volumeDown', player => {
    // TODO
  }],
  ['fullScreen', player => {
    // TODO
  }],
  ['mute', player => {
    // TODO
  }],
  ['pause', player => {
    // TODO
  }]
]);

export const executeAction = (key, player) => actionMap.has(key)
  ? actionMap.get(key)(player)
  : undefined;
