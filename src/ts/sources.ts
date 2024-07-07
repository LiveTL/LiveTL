import { writable, Writable } from 'svelte/store';
import { paramsTabId, paramsFrameId } from '../js/constants';
import { timestamp } from '../js/store';
import { useReconnect } from '../submodules/chat/src/ts/chat-utils.ts';

export function twitchSource(): Writable<Ltl.Message | null> {
  if (paramsTabId == null || paramsFrameId == null) return writable(null);

  const messageStore: Writable<Ltl.Message | null> = writable(null);

  const frameInfo = {
    tabId: parseInt(paramsTabId),
    frameId: parseInt(paramsFrameId)
  };

  useReconnect(() => {
    const port = chrome.runtime.connect({
      name: JSON.stringify(frameInfo)
    });
    // port.postMessage({ type: 'registerClient', frameInfo });

    port.onMessage.addListener((response: Chat.BackgroundMessage) => {
      switch (response.type) {
        case 'sendLtlMessage':
          messageStore.set(response.message);
          break;
        case 'updatePlayerProgress':
          timestamp.set(response.playerProgress);
          break;
      }
    });

    return port;
  });

  return messageStore;
}
