import { isVod, parseMessageElement } from '../twitch-parser';
import { nodeIsElement } from '../utils';
import { getFrameInfoAsync } from '../../submodules/chat/src/ts/chat-utils';

const liveChatSelector = '.chat-room .chat-scrollable-area__message-container';
const vodChatSelector = '.video-chat .video-chat__message-list-wrapper ul';

let tries = 0;
const clients: chrome.runtime.Port[] = [];

function registerClient(port: chrome.runtime.Port): void {
  if (clients.some((client) => client.name === port.name)) {
    console.debug('Client already registered', { port, clients });
    return;
  }

  port.onDisconnect.addListener(() => {
    const i = clients.findIndex((clientPort) => clientPort.name === port.name);
    if (i < 0) {
      console.error('Failed to unregister client', { port, clients });
      return;
    }
    clients.splice(i, 1);
    console.debug('Unregister client successful', { port, clients });
  });

  clients.push(port);
}

async function load(): Promise<void> {
  const messageContainer = document?.querySelector(isVod ? vodChatSelector : liveChatSelector);
  // console.debug({ messageContainer });
  if (messageContainer == null) {
    if (tries++ < 5) {
      setTimeout(() => async () => await load(), 3000);
    } else {
      console.error('Could not find chat container');
    }
    return;
  }

  const observer = new MutationObserver((mutationRecords) => {
    mutationRecords.forEach((record) => {
      const added = record.addedNodes;
      if (added.length < 1) return;
      added.forEach((node) => {
        if (!nodeIsElement(node)) return;
        const message = parseMessageElement(node);
        if (message == null) return;
        console.debug({ message });
        clients.forEach((client) => client.postMessage({ type: 'message', message }));
      });
    });
  });

  chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
      switch (message.type) {
        case 'registerClient':
          registerClient(port);
          break;
        default:
          console.error('Unknown message type', port, message);
          break;
      }
    });
  });

  observer.observe(messageContainer, { childList: true });

  const frameInfo = await getFrameInfoAsync();

  // TODO: pass frameInfo to popup/embed. Example:
  // params.set('tabid', frameInfo.tabId.toString());
  // params.set('frameid', frameInfo.frameId.toString());
}

load().catch((e) => console.error(e));
