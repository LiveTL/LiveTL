import { isVod, parseMessageElement } from '../twitch-parser';
import { nodeIsElement, injectLtlLauncher, ltlButtonParams } from '../utils';
import { getFrameInfoAsync, createPopup, isValidFrameInfo } from '../../submodules/chat/src/ts/chat-utils';
import { mdiOpenInNew, mdiIframeArray } from '@mdi/js';
import { chatSize, twitchEnabled } from '../../js/store';
import { get } from 'svelte/store';

const liveChatSelector = '.chat-room .chat-scrollable-area__message-container';
const vodChatSelector = '.video-chat .video-chat__message-list-wrapper ul';

function getCommonParams(frameInfo: Chat.FrameInfo): URLSearchParams {
  const params = new URLSearchParams();
  params.set('tabid', frameInfo.tabId.toString());
  params.set('frameid', frameInfo.frameId.toString());
  params.set('twitchUrl', window.location.href);
  params.set('title', document.title);
  return params;
}

function injectLtlButtons(frameInfo: Chat.FrameInfo): void {
  const chat = document.querySelector<HTMLElement>(isVod() ? '.video-chat' : '.stream-chat');
  if (chat == null) {
    console.error('Could not find chat');
    return;
  }

  injectLtlLauncher(chat, [
    () => {
      const popoutParams = getCommonParams(frameInfo);
      const popoutUrl = chrome.runtime.getURL(`popout.html?${popoutParams.toString()}`);
      return ltlButtonParams('TL Popout', () => createPopup(popoutUrl), mdiOpenInNew, true);
    },
    (ltlWrapper: HTMLDivElement) => {
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
        dots.style.transform = 'translateY(-2.5%)';
        resizeBar.appendChild(dots);
        const chatRoom = ltlWrapper.previousElementSibling as HTMLElement;
        chatRoom.style.overflow = 'hidden auto';
        const setChatRoomHeight = (height: string): void => {
          chatRoom.style.maxHeight = height;
          chatRoom.style.minHeight = height;
        };
        setChatRoomHeight(`${get(chatSize)}%`);
        const header = chat.querySelector(isVod() ? '.video-chat__header' : '.stream-chat-header');
        if (header == null) {
          console.error('Could not find header while resizing chat');
          return;
        }
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

      return ltlButtonParams('Embed TLs', () => {
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
    }
  ], { padding: '3px', fontWeight: '600' });
}

function load(): void {
  if (document.getElementById('ltl-wrapper') != null) return;

  const messageContainer = document.querySelector(isVod() ? vodChatSelector : liveChatSelector);
  // console.debug({ messageContainer });
  if (messageContainer == null) return;

  const port: Chat.Port = chrome.runtime.connect();
  port.postMessage({ type: 'registerInterceptor', source: 'ltlMessage' });

  const observer = new MutationObserver((mutationRecords) => {
    mutationRecords.forEach((record) => {
      // console.debug({ record });
      const added = record.addedNodes;
      if (added.length < 1) return;
      added.forEach((node) => {
        if (!nodeIsElement(node)) return;
        const message = parseMessageElement(node);
        if (message == null) return;
        // console.debug({ message });
        port.postMessage({ type: 'sendLtlMessage', message });
      });
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
    .catch(console.error);
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

twitchEnabled.loaded.then(() => {
  if (get(twitchEnabled)) keepLoaded();
}).catch(console.error);
