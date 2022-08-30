import { writable, Writable } from 'svelte/store';
import { paramsTabId, paramsFrameId } from '../js/constants';
import { timestamp } from '../js/store';

export function twitchSource(): Writable<Ltl.Message | null> {
  if (paramsTabId == null || paramsFrameId == null) return writable(null);

  const port: Chat.Port = chrome.runtime.connect();
  const frameInfo = {
    tabId: parseInt(paramsTabId),
    frameId: parseInt(paramsFrameId)
  };
  port.postMessage({ type: 'registerClient', frameInfo });

  const messageStore: Writable<Ltl.Message | null> = writable(null);

  port.onMessage.addListener((response) => {
    switch (response.type) {
      case 'ltlMessage':
        messageStore.set(response.message);
        break;
      case 'playerProgress':
        timestamp.set(response.playerProgress);
        break;
    }
  });

  return messageStore;
}
