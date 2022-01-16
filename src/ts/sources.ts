import { writable, Writable } from 'svelte/store';
import { paramsTabId, paramsFrameId } from '../js/constants';

// TODO: attach source to filters when window mounted for twitch

export function twitchSource(): Writable<Ltl.Message | null> {
  if (paramsTabId == null || paramsFrameId == null) return writable(null);

  const portName = `${Date.now()}${Math.random()}`;

  // MV3 don't support background scripts
  const port = chrome.tabs.connect(
    parseInt(paramsTabId),
    { frameId: parseInt(paramsFrameId), name: portName }
  );
  port.postMessage({ type: 'registerClient' });

  const messageStore: Writable<Ltl.Message | null> = writable(null);

  port.onMessage.addListener((response) => {
    switch (response.type) {
      case 'message':
        messageStore.set(response.message);
        break;
    }
  });

  return messageStore;
}
