import YtcFilterButtons from '../components/YtcFilterButtons.svelte';
import { isLiveTL } from '../ts/chat-constants';
import { getFrameInfoAsync, isValidFrameInfo, frameIsReplay, createPopup } from '../ts/chat-utils';
import {
  initInterceptor,
  processMessageChunk,
  processSentMessage,
  setInitialData,
  setTheme,
  updatePlayerProgress,
} from '../ts/messaging';
import { autoOpenFilterPanel, filterInBackground, initialSetupDone } from '../ts/storage';
import { detectForceReload } from '../ts/ytcf-logic';

const isFirefox = navigator.userAgent.includes('Firefox');

const getScriptURL = (path: string): string => {
  if (isLiveTL) {
    return chrome.runtime.getURL('ytcfilter/scripts/' + path);
  }
  return chrome.runtime.getURL('scripts/' + path);
};

const ensureLiveTLTranslatorHost = (): void => {
  if (!isLiveTL || !isFirefox) return;
  if (document.querySelector('#hc-ltl-translator-host')) return;

  const script = document.createElement('script');
  script.id = 'hc-ltl-translator-host';
  script.src = getScriptURL('chat-translation-host.js');
  script.onload = () => script.remove();
  script.onerror = () => script.remove();
  (document.head ?? document.documentElement).appendChild(script);
};

const chatLoaded = async (): Promise<void> => {
  detectForceReload();

  const metagetter = document.createElement('script');
  metagetter.src = getScriptURL('chat-metagetter.js');
  const ytcfg: any = await new Promise((resolve) => {
    window.addEventListener('fetchMeta', (event) => {
      resolve(JSON.parse((event as any).detail as string));
    });
    document.body.appendChild(metagetter);
  });

  // Init and inject interceptor
  initInterceptor('ytc', ytcfg, frameIsReplay());
  window.addEventListener('messageReceive', (d) => {
    processMessageChunk((d as CustomEvent).detail);
  });
  window.addEventListener('messageSent', (d) => {
    processSentMessage((d as CustomEvent).detail);
  });
  const script = document.createElement('script');
  script.src = getScriptURL('chat-interceptor.js');
  document.body.appendChild(script);

  // Handle initial data
  const scripts = document.querySelectorAll('script');
  let json = '{}';
  for (const script of Array.from(scripts)) {
    const start = 'window["ytInitialData"] = ';
    const text = script.text;
    if (!text || !text.startsWith(start)) {
      continue;
    }
    json = text.replace(start, '').slice(0, -1);
    break;
  }
  window.addEventListener('videoInfoYtcFilter', (d) => {
    setInitialData(json, JSON.parse((d as CustomEvent).detail));
  });

  // Catch YT messages
  window.addEventListener('message', (d) => {
    if (d.data['yt-player-video-progress'] != null) {
      updatePlayerProgress(d.data['yt-player-video-progress']);
    }
  });

  // Update dark theme whenever it changes
  let wasDark: boolean | undefined;
  const html = document.documentElement;
  const sendTheme = (): void => {
    const isDark = html.hasAttribute('dark');
    if (isDark === wasDark) return;
    setTheme(isDark);
    wasDark = isDark;
  };
  new MutationObserver(sendTheme).observe(html, {
    attributes: true,
  });
  sendTheme();

  document.body.style.minWidth = document.body.style.minHeight = '0px';

  const ytcPrimaryContent = document.querySelector('#chat-messages');
  if (!ytcPrimaryContent) {
    console.error('Failed to find #chat-messages');
    return;
  }
  const immediateChild = document.createElement('div');
  ytcPrimaryContent.prepend(immediateChild);
  new YtcFilterButtons({
    target: immediateChild,
  });

  ensureLiveTLTranslatorHost();

  const frameInfo = await getFrameInfoAsync();
  if (!isValidFrameInfo(frameInfo)) {
    console.error('Failed to get valid frame info', { frameInfo });
    return;
  }
  const params = new URLSearchParams();
  params.set('tabid', frameInfo.tabId.toString());
  params.set('frameid', frameInfo.frameId.toString());
  params.set('continuation', new URLSearchParams(window.location.search).get('continuation') ?? '');
  if (frameIsReplay()) params.set('isReplay', 'true');
  const source = `https://www.youtube.com/embed/ytcfilter_embed?${params.toString()}`;

  const ytcfilterElement = document.querySelector<HTMLDivElement>('.ytcf-iframe');
  if (!ytcfilterElement) {
    console.error('Failed to find .ytcf-iframe');
    return;
  }
  const activatorButton = document.querySelector<HTMLButtonElement>('.ytcf-launch-button');
  const popoutButton = document.querySelector<HTMLButtonElement>('.ytcf-popout-button');
  const settingsButton = document.querySelector<HTMLButtonElement>('.ytcf-settings-button');
  const activatorText = activatorButton?.querySelector<HTMLSpanElement>('.activator-text');
  const activatorIcon = activatorButton?.querySelector<HTMLSpanElement>('.activator-icon');
  const resizeBar = document.querySelector<HTMLDivElement>('.ytcf-resize-bar');
  if (!activatorButton || !popoutButton || !settingsButton || !activatorText || !activatorIcon || !resizeBar) {
    console.error('Failed to find YtcFilter controls');
    return;
  }

  const clickListener = async (forceClose = false): Promise<void> => {
    const frame = ytcfilterElement.querySelector('iframe');
    if (forceClose || ytcfilterElement.style.display === 'block') {
      activatorText.textContent = 'Embed';
      activatorIcon.textContent = 'expand';
      ytcfilterElement.style.display = 'none';
      resizeBar.style.display = 'none';
      if (frame && (forceClose || !(await filterInBackground.get()))) {
        frame.src = 'about:blank';
      }
      return;
    }
    activatorText.textContent = 'Hide';
    activatorIcon.textContent = 'cancel_presentation';
    ytcfilterElement.style.display = 'block';
    resizeBar.style.display = 'flex';
    if (frame && frame.src !== source) {
      frame.src = source;
    } else {
      (frame?.contentWindow as any).toggleTopBar();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  activatorButton.addEventListener('click', async () => await clickListener());
  const iframe = document.createElement('iframe');
  iframe.style.border = '0px';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  if (await filterInBackground.get()) {
    iframe.src = source;
  }
  ytcfilterElement.appendChild(iframe);
  popoutButton.addEventListener('click', () => {
    createPopup(source);
    void clickListener(true);
  });
  settingsButton.addEventListener('click', () => {
    createPopup(chrome.runtime.getURL((isLiveTL ? 'ytcfilter' : '') + '/options.html'));
  });

  if (!(await initialSetupDone.get()) || (await autoOpenFilterPanel.get())) {
    void clickListener();
  }
};

if (isLiveTL) {
  chatLoaded().catch(console.error);
} else {
  setTimeout(() => {
    chatLoaded().catch(console.error);
  }, 500);
}
