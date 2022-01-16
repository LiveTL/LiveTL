import { isVod, parseMessageElement } from '../twitch-parser';
import { nodeIsElement } from '../utils';
import { getFrameInfoAsync, createPopup, isValidFrameInfo } from '../../submodules/chat/src/ts/chat-utils';

const liveChatSelector = '.chat-room .chat-scrollable-area__message-container';
const vodChatSelector = '.video-chat .video-chat__message-list-wrapper ul';

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

function injectLtlButton(frameInfo: Chat.FrameInfo): void {
  const chat = document.querySelector(isVod ? '.video-chat' : '.chat-room');
  if (chat == null) {
    console.error('Could not find chat');
    return;
  }

  const button = document.createElement('button');
  button.id = 'ltl-button';
  button.innerText = 'Open popup';

  const params = new URLSearchParams();
  params.set('tabid', frameInfo.tabId.toString());
  params.set('frameid', frameInfo.frameId.toString());
  params.set('twitchPath', window.location.pathname);
  params.set('title', document.title);

  button.addEventListener('click', () => {
    createPopup(chrome.runtime.getURL(`popout.html?${params.toString()}`));
  });
  chat.appendChild(button);
  // console.debug('Injected button', { button });
}

function load(): void {
  if (document.getElementById('ltl-button') != null) return;

  const messageContainer = document?.querySelector(isVod ? vodChatSelector : liveChatSelector);
  // console.debug({ messageContainer });
  if (messageContainer == null) return;

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

  getFrameInfoAsync()
    .then((frameInfo) => {
      if (!isValidFrameInfo(frameInfo)) {
        console.error('Invalid frame info', frameInfo);
        return;
      }
      injectLtlButton(frameInfo);
    })
    .catch((e) => console.error(e));
}

/**
 * Recursive setTimeout to keep injecting whenever chat unloads/reloads when
 * navigating thru the site.
 */
function keepLoaded(): void {
  setTimeout(() => {
    load();
    keepLoaded();
  }, 3000);
}

keepLoaded();
