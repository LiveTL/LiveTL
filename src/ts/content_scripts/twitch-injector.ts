import { isVod, parseMessageElement } from '../twitch-parser';
import { nodeIsElement } from '../utils';
import { getFrameInfoAsync, createPopup, isValidFrameInfo } from '../../submodules/chat/src/ts/chat-utils';
import { mdiOpenInNew, mdiIframeArray, mdiCloseThick } from '@mdi/js';
import { chatSize } from '../../js/store';
import { get } from 'svelte/store';

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
  params.set('twitchUrl', window.location.href);
  params.set('title', document.title);
  return params;
}

function createButton(text: string, callback: () => void, icon: string, shift = false): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = 'ltl-button';
  b.innerText = text;
  b.addEventListener('click', callback);
  const svg = document.createElement('svg');
  b.appendChild(svg);
  svg.outerHTML = `
    <svg viewBox="0 0 24 24" class="ltl-svg ${shift ? 'ltl-shifted-svg' : ''}">
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
      padding: 3px;
      transition: background-color 50ms linear;
      font-weight: 600;
    }
    .ltl-button:hover {
      background-color: #0099ffa0;
    }
    .ltl-svg {
      height: 15px;
      vertical-align: middle;
      margin: 0px 5px;
    }
    .ltl-shifted-svg {
      transform: translateY(-1px);
    }
  `;
  const style = document.createElement('style');
  style.innerText = css;
  document.body.appendChild(style);

  const ltlWrapper = document.createElement('div');
  ltlWrapper.id = 'ltl-wrapper';

  const popoutParams = getCommonParams(frameInfo);
  const popoutUrl = chrome.runtime.getURL(`popout.html?${popoutParams.toString()}`);
  const popoutButton = createButton('TL Popout', () => createPopup(popoutUrl), mdiOpenInNew, true);

  const embedParams = getCommonParams(frameInfo);
  embedParams.set('embedded', 'true');
  const embedUrl = chrome.runtime.getURL(`popout.html?${embedParams.toString()}`);
  const createResizableBar = (parent: HTMLDivElement): void => {
    const resizeBar = document.createElement('div');
    resizeBar.style.width = '100%';
    resizeBar.style.height = '10px';
    resizeBar.style.backgroundColor = '#4d4d4d';
    resizeBar.style.cursor = 'ns-resize';
    resizeBar.style.userSelect = 'none';
    resizeBar.style.color = 'white';
    resizeBar.style.overflow = 'visible';
    resizeBar.style.justifyContent = 'center';
    resizeBar.style.alignItems = 'center';
    resizeBar.style.width = '100%';
    resizeBar.style.fontSize = '25px';
    resizeBar.style.display = 'flex';
    const dots = document.createElement('span');
    dots.innerText = '⋯';
    dots.style.transform = 'translate(-2px, -1.5px)';
    resizeBar.appendChild(dots);
    const chatRoom = ltlWrapper.previousElementSibling as HTMLElement;
    chatRoom.style.overflow = 'hidden auto';
    const setChatRoomHeight = (height: string): void => {
      chatRoom.style.maxHeight = height;
      chatRoom.style.minHeight = height;
    };
    setChatRoomHeight(`${get(chatSize)}%`);
    const refreshHeights = (originalEvent: MouseEvent | undefined = undefined): void => {
      if (originalEvent && originalEvent.buttons !== 1) return;
      const clientRect = chatRoom.getBoundingClientRect();
      const refreshParent = (): void => {
        const { bottom: resizeBarBottom } = resizeBar.getBoundingClientRect();
        const { bottom: maxBottom } = chat.getBoundingClientRect();
        parent.style.height = `${maxBottom - resizeBarBottom}px`;
      };
      setChatRoomHeight(`${clientRect.height}px`);
      refreshParent();
      parent.style.display = 'none';
      const updateStyles = (): void => {
        parent.style.display = 'block';
        const chatHeight = chat.getBoundingClientRect().height;
        const chatRoomHeight = chatRoom.getBoundingClientRect().height;
        const parentHeight = parent.getBoundingClientRect().height;
        parent.style.height = `${100 * parentHeight / chatHeight}%`;
        const percent = 100 * chatRoomHeight / chatHeight;
        setChatRoomHeight(`${percent}%`);
        chatSize.set(percent);
      };
      const header = chat.querySelector(isVod() ? '.video-chat__header' : '.stream-chat-header');
      if (header == null) {
        console.error('Could not find header while resizing chat');
        return;
      }
      const maxChatRoomHeight = chat.clientHeight - header.clientHeight - resizeBar.clientHeight;
      if (originalEvent) {
        const moveListener = (event: MouseEvent): void => {
          const chatRoomHeight = Math.min(clientRect.height + (event.clientY - originalEvent.clientY), maxChatRoomHeight);
          setChatRoomHeight(`${chatRoomHeight}px`);
          refreshParent();
        };
        window.addEventListener('mousemove', moveListener);
        window.addEventListener('mouseup', () => {
          window.removeEventListener('mousemove', moveListener);
          updateStyles();
        });
      } else {
        updateStyles();
      }
    };
    resizeBar.addEventListener('mousedown', refreshHeights);
    window.addEventListener('resize', () => refreshHeights());
    chat.appendChild(resizeBar);
  };

  const embedButton = createButton('Embed TLs', () => {
    const parent = document.createElement('div');
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    parent.style.width = '100%';
    parent.style.height = '100%';
    parent.appendChild(iframe);
    createResizableBar(parent);
    chat.appendChild(parent);
    ltlWrapper.style.display = 'none';
  }, mdiIframeArray, true);

  const hideButton = createButton('', () => (ltlWrapper.style.display = 'none'), mdiCloseThick);
  hideButton.style.flexGrow = '0';

  ltlWrapper.appendChild(popoutButton);
  ltlWrapper.appendChild(embedButton);
  ltlWrapper.appendChild(hideButton);
  chat.append(ltlWrapper);
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
        // console.debug({ message });
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

let first = true;
/**
 * Recursive setTimeout to keep injecting whenever chat unloads/reloads when
 * navigating thru the site.
 */
function keepLoaded(): void {
  setTimeout(() => {
    first = false;
    load();
    keepLoaded();
  }, first ? 0 : 3000);
}

keepLoaded();
