import { isVod, parseMessageElement } from '../twitch-parser';
import { nodeIsElement } from '../utils';
import { getFrameInfoAsync, createPopup, isValidFrameInfo } from '../../submodules/chat/src/ts/chat-utils';
import { mdiOpenInNew, mdiIframeArray } from '@mdi/js';

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

function getCommonParams(frameInfo: Chat.FrameInfo): URLSearchParams {
  const params = new URLSearchParams();
  params.set('tabid', frameInfo.tabId.toString());
  params.set('frameid', frameInfo.frameId.toString());
  params.set('twitchPath', window.location.pathname);
  params.set('title', document.title);
  return params;
}

function createButton(text: string, callback: () => void, icon: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = 'ltl-button';
  b.innerText = text;
  b.addEventListener('click', callback);
  const svg = document.createElement('svg');
  b.appendChild(svg);
  svg.outerHTML = `
    <svg viewBox="0 0 24 24" class="ltl-svg">
      <path d="${icon}" fill="white"></path>
    </svg>
  `;
  return b;
}

function injectLtlButtons(frameInfo: Chat.FrameInfo): void {
  const chat = document.querySelector(isVod() ? '.video-chat' : '.stream-chat');
  if (chat == null) {
    console.error('Could not find chat');
    return;
  }

  const css = `
    #ltl-wrapper {
      display: flex;
      flex-direction: row;
    }
    .ltl-button {
      flex-grow: 1;
      text-align: center;
      background-color: #0099ffb5;
      color: white;
      padding: 5px;
      transition: background-color 50ms linear;
    }
    .ltl-button:hover {
      background-color: #0099ffa0;
    }
    .ltl-svg {
      height: 15px;
      vertical-align: middle;
      margin-left: 5px;
    }
  `;
  const style = document.createElement('style');
  style.innerText = css;
  document.body.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.id = 'ltl-wrapper';

  const popoutParams = getCommonParams(frameInfo);
  const popoutUrl = chrome.runtime.getURL(`popout.html?${popoutParams.toString()}`);
  const popoutButton = createButton('TL Popout', () => createPopup(popoutUrl), mdiOpenInNew);

  const embedParams = getCommonParams(frameInfo);
  embedParams.set('embedded', 'true');
  const embedUrl = chrome.runtime.getURL(`popout.html?${embedParams.toString()}`);
  const embedButton = createButton('Embed TLs', () => {
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.style.width = '100%';
    iframe.style.height = '80%';
    wrapper.style.display = 'none';
    chat.appendChild(iframe);
  }, mdiIframeArray);

  wrapper.appendChild(popoutButton);
  wrapper.appendChild(embedButton);
  chat.append(wrapper);
}

function load(): void {
  if (document.getElementById('ltl-wrapper') != null) return;

  const messageContainer = document.querySelector(isVod() ? vodChatSelector : liveChatSelector);
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
      injectLtlButtons(frameInfo);
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
