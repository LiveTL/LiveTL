import { mdiOpenInNew, mdiYoutubeTv, mdiIframeArray } from '@mdi/js';
import { getFrameInfoAsync, createPopup } from '../../submodules/chat/src/ts/chat-utils';
import { paramsEmbedDomain, AutoLaunchMode } from '../../js/constants.js';
import { autoLaunchMode } from '../../js/store.js';
import { constructParams, openLiveTL } from '../../js/utils.js';
import { injectLtlLauncher, ltlButtonParams } from '../utils';

for (const eventName of ['visibilitychange', 'webkitvisibilitychange', 'blur']) {
  window.addEventListener(eventName, e => e.stopImmediatePropagation(), true);
}

async function loaded(): Promise<void> {
  const elem = document.querySelector<HTMLElement>('yt-live-chat-app');
  if (!elem) {
    console.error('Could not find yt-live-chat-app');
    return;
  }
  elem.style.minWidth = '0px';
  elem.style.minHeight = '0px';
  elem.style.width = '100%';
  elem.style.height = '100%';
  elem.style.maxWidth = '';
  elem.style.maxHeight = '';
  const body = document.body;
  body.style.width = '100%';
  body.style.height = '100%';
  body.style.position = 'fixed';

  const frameInfo = await getFrameInfoAsync();
  window.parent.postMessage({ type: 'frameInfo', frameInfo: frameInfo }, '*');

  if (paramsEmbedDomain === chrome.runtime.id) {
    console.debug('Chat is in extension, not injecting LTL buttons.');
    return;
  }

  const tlPopout = (): void => {
    const popoutParams = constructParams();
    popoutParams.set('popout', 'true');
    popoutParams.set('tabid', frameInfo.tabId.toString());
    popoutParams.set('frameid', frameInfo.frameId.toString());
    try {
      popoutParams.set(
        'title',
        window.parent.document.querySelector('#container > .title').textContent
      );
    } catch (e) {
      if (e instanceof DOMException) {
        console.debug('Ignored expected CORS error', { e });
      } else {
        throw e;
      }
    }
    createPopup(
      chrome.runtime.getURL(`popout.html?${popoutParams}`)
    );
  };
  const embedTLs = (): void => {
    const embeddedParams = constructParams();
    embeddedParams.set('embedded', 'true');
    embeddedParams.set('tabid', frameInfo.tabId.toString());
    embeddedParams.set('frameid', frameInfo.frameId.toString());
    document.body.outerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'fixed';
    iframe.src = chrome.runtime.getURL(`watch.html?${embeddedParams}`);
    document.body.appendChild(iframe);
    window.addEventListener('message', d => {
      iframe.contentWindow.postMessage(d.data, '*');
    });
  };

  autoLaunchMode.loaded.then(mode => {
    switch (mode) {
      case AutoLaunchMode.NONE: {
        break;
      }
      case AutoLaunchMode.FULLPAGE: {
        openLiveTL();
        break;
      }
      case AutoLaunchMode.POPOUT: {
        tlPopout();
        break;
      }
      case AutoLaunchMode.EMBEDDED: {
        embedTLs();
        break;
      }
    }
  });

  /** Start buttons injections */
  const renderer = document.querySelector<HTMLElement>('yt-live-chat-renderer');
  injectLtlLauncher(renderer, [
    ltlButtonParams('Open LiveTL', openLiveTL, mdiYoutubeTv),
    ltlButtonParams('TL Popout', tlPopout, mdiOpenInNew),
    ltlButtonParams('Embed TLs', embedTLs, mdiIframeArray)
  ], { padding: '5px', fontWeight: '700', fontSize: '11px', fontFamily: 'Roboto, Arial, sans-serif', borderWidth: '0' });
}

window.addEventListener('message', (packet) => {
  if (packet.origin !== window.origin && !packet.data.type) window.postMessage(packet.data, '*');
});

/**
 * Load on DOMContentLoaded or later.
 * Does not matter unless run_at is specified in manifest.
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loaded);
} else {
  loaded();
}
