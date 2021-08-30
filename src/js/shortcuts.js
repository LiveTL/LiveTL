import { defaultShortcuts, keyboardShortcuts } from './store.js';
import { clamp } from './utils.js';
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
    player.setVolume(clamp(player.getVolume() + 10, 0, 100));
  }],
  ['volumeDown', player => {
    player.setVolume(clamp(player.getVolume() - 10, 0, 100));
  }],
  ['fullScreen', player => {
    // TODO
  }],
  ['mute', player => {
    player.mute();
  }],
  ['togglePlayPause', player => {
    const paused = player.getPlayerState() == 2;
    paused ? player.playVideo() : player.pauseVideo();
  }]
]);

export const executeAction = (key, player) => actionMap.has(key)
  ? actionMap.get(key)(player)
  : undefined;
