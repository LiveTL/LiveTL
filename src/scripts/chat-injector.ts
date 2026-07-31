import HcButton from '../components/HyperchatButton.svelte';
import HcSettings from '../components/SettingsButton.svelte';
import { getFrameInfoAsync, isValidFrameInfo, frameIsReplay, checkInjected } from '../ts/chat-utils';
import { isLiveTL } from '../ts/chat-constants';
import { hcEnabled, autoLiveChat } from '../ts/storage';
import {
  initInterceptor,
  processMessageChunk,
  processSentMessage,
  setInitialData,
  updatePlayerProgress,
  setTheme
} from '../ts/messaging';

const isFirefox = navigator.userAgent.includes('Firefox');
let hcSettings: HcSettings | null = null;

const hcWarning = 'An existing HyperChat button has been detected. This ' +
  'usually means both LiveTL and standalone HyperChat are enabled. ' +
  'LiveTL already includes HyperChat, so please enable only one of them.\n\n' +
  'Having multiple instances of the same scripts running WILL cause ' +
  'problems such as chat messages not loading.';

const getScriptURL = (path: string): string => {
  if (isLiveTL) {
    return chrome.runtime.getURL('submodules/chat/src/scripts/' + path);
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
  if (!isLiveTL && checkInjected(hcWarning)) return;

  const metagetter = document.createElement('script');
  metagetter.src = getScriptURL('chat-metagetter.js');
  const ytcfg: any = await new Promise((resolve) => {
    window.addEventListener('fetchMeta', (event) => {
      resolve(JSON.parse((event as any).detail as string));
    });
    document.body.appendChild(metagetter);
  });
  console.log(ytcfg);

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
  const scripts = document.querySelector('body')?.querySelectorAll('script');
  if (!scripts) {
    console.error('Unable to get script elements.');
    return;
  }
  for (const script of Array.from(scripts)) {
    const start = 'window["ytInitialData"] = ';
    const text = script.text;
    if (!text || !text.startsWith(start)) {
      continue;
    }
    const json = text.replace(start, '').slice(0, -1);
    setInitialData(json);
    break;
  }

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
    attributes: true
  });
  sendTheme();

  document.body.style.minWidth = document.body.style.minHeight = '0px';
  const hyperChatEnabled = await hcEnabled.get();

  // Inject HC button
  const ytcPrimaryContent = document.querySelector('#primary-content');
  if (!ytcPrimaryContent) {
    console.error('Failed to find #primary-content');
    return;
  }
  new HcButton({
    target: ytcPrimaryContent
  });

  // Inject HC settings
  const injectSettings = (): void => {
    const destroyButton = (): void => {
      if (hcSettings !== null) {
        try {
          hcSettings.$destroy();
        } catch (_) {}
      }
    }

    const ytcItemMenu = document.querySelector('tp-yt-paper-listbox#items');
    if (ytcItemMenu) {
      // Prevent duplicates
      if (document.getElementById('hc-settings')) return;

      destroyButton();
      hcSettings = new HcSettings({
        target: ytcItemMenu
      });

      return;
    }

    destroyButton();
  };

  const chatApp = document.querySelector('yt-live-chat-app');
  if (chatApp) {
    new MutationObserver(injectSettings).observe(chatApp, {
      childList: true,
      subtree: true
    });
  }

  // Everything past this point will only run if HC is enabled
  if (!hyperChatEnabled) return;

  ensureLiveTLTranslatorHost();

  const frameInfo = await getFrameInfoAsync();
  if (!isValidFrameInfo(frameInfo)) {
    console.error('Failed to get valid frame info', { frameInfo });
    return;
  }
  const params = new URLSearchParams();
  params.set('tabid', frameInfo.tabId.toString());
  params.set('frameid', frameInfo.frameId.toString());
  if (frameIsReplay()) params.set('isReplay', 'true');
  // inject into an empty 404 page
  const source = `https://www.youtube.com/embed/hyperchat_embed?${params.toString()}`;

  const ytcItemList = document.querySelector('#chat>#item-list');
  if (!ytcItemList) {
    console.error('Failed to find #chat>#item-list');
    return;
  }

  // Inject hyperchat
  ytcItemList.outerHTML = `
  <iframe id="hyperchat" src="${source}" style="border: 0px; width: 100%; height: 100%;"/>
  `;

  // Remove ticker element
  const ytcTicker = document.querySelector('#ticker');
  if (!ytcTicker) {
    console.error('Failed to find #ticker');
    return;
  }
  ytcTicker.remove();

  if (await autoLiveChat.get()) {
    const live = document.querySelector<HTMLElement>('tp-yt-paper-listbox#menu > :nth-child(2)');
    if (!live) {
      console.error('Failed to find Live Chat menu item');
      return;
    }
    live.click();
  }
};

if (isLiveTL) {
  chatLoaded().catch(console.error);
} else {
  setTimeout(() => {
    chatLoaded().catch(console.error);
  }, 500);
}
