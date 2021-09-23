import { mdiOpenInNew, mdiYoutubeTv, mdiIframeArray } from '@mdi/js';
import { getFrameInfoAsync, createPopup } from '../../submodules/chat/scripts/chat-utils.js';
import { fixLeaks } from '../../submodules/chat/src/plugins/ytc-fix-memleaks.js';
import { paramsEmbedDomain, AutoLaunchMode, PostMessage } from '../constants.js';
import { autoLaunchMode } from '../store.js';

for (const eventName of ['visibilitychange', 'webkitvisibilitychange', 'blur']) {
  window.addEventListener(eventName, e => e.stopImmediatePropagation(), true);
}

const styleLiveTLButton = (a, color) => {
  a.style.backgroundColor = `${color || 'rgb(0, 153, 255)'}`;
  a.style.font = 'inherit';
  a.style.fontSize = '11px';
  a.style.fontWeight = 'bold';
  a.style.width = '100%';
  a.style.margin = 0;
  a.style.textAlign = 'center';
  a.style.display = 'inline-block';
  // a.style.boxShadow = 'rgb(194 194 194) 0px 0px 4px 1px inset';
};
  
const setLiveTLButtonAttributes = (a) => {
  [
    'yt-simple-endpoint',
    'style-scope',
    'ytd-toggle-button-renderer'
  ].forEach(c => a.classList.add(c));
  a.tabindex = '-1';
};

const getLiveTLButton = (color) => {
  const a = document.createElement('a');
  setLiveTLButtonAttributes(a);
  styleLiveTLButton(a, color);
  a.innerHTML = `
  <paper-button id="button" class="style-scope ytd-toggle-button-renderer livetlActivator" role="button" tabindex="0" animated=""
  elevation="0" aria-disabled="false" style="
    padding: 5px;
    display: inline-block;
    margin: 0;
    height: auto !important;
  ">
    <yt-formatted-string id="text" class="style-scope ytd-toggle-button-renderer" style="display: block;">
    </yt-formatted-string>
    <paper-ripple class="style-scope paper-button">
      <div id="background" class="style-scope paper-ripple" style="opacity: 0.00738;"></div>
      <div id="waves" class="style-scope paper-ripple"></div>
    </paper-ripple>
    <paper-ripple class="style-scope paper-button">
      <div id="background" class="style-scope paper-ripple" style="opacity: 0.007456;"></div>
      <div id="waves" class="style-scope paper-ripple"></div>
    </paper-ripple>
    <paper-ripple class="style-scope paper-button">
      <div id="background" class="style-scope paper-ripple" style="opacity: 0.007748;"></div>
      <div id="waves" class="style-scope paper-ripple"></div>
    </paper-ripple>
  </paper-button>
  `;
  a.style.height = '100%';
  a.style.display = 'flex';
  a.style.justifyContent = 'center';
  return a;
};

const makeButton = (text, callback, color='rgb(0, 153, 255)', icon='') => {
  let a = document.createElement('span');
  a.style.flexGrow = 1;
  a.style.flexBasis = 0;
  a.style.position = 'relative';
  a.appendChild(getLiveTLButton(color));
  const e = document.querySelector('yt-live-chat-renderer');
  let elem = e.querySelector('.livetlButtonWrapper');
  if (!elem) {
    elem = document.createElement('div');
    elem.className = 'livetlButtonWrapper';
    elem.style.display = 'flex';
    e.appendChild(elem);
  }
  elem.appendChild(a);
  a.querySelector('a').addEventListener('click', callback);
  const textbox = a.querySelector('yt-formatted-string');
  const svg = document.createElement('svg');
  textbox.textContent = text;
  textbox.appendChild(svg);
  textbox.style.color = 'white';
  svg.outerHTML = `
    <svg viewBox="0 0 24 24" style="
      height: 15px;
      vertical-align: bottom;
      margin-left: 5px;
    ">
      <path d="${icon}" fill="white"></path>
    </svg>
  `;
};

const constructParams = () => {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v') || (new URLSearchParams(window.parent.location.search).get('v'));
  params.set('video', v);
  if (window.location.pathname.includes('live_chat_replay')) {
    params.set('isReplay', true);
  }
  return params;
};

async function loaded() {
  const script = document.createElement('script');
  script.innerHTML = `(${fixLeaks.toString()})();`;
  document.body.appendChild(script);

  const elem = document.querySelector('yt-live-chat-app');
  elem.style.minWidth = '0px';
  elem.style.minHeight = '0px';
  elem.style.width = '100%';
  elem.style.height = '100%';
  elem.style.maxWidth = undefined;
  elem.style.maxHeight = undefined;
  const body = document.querySelector('body');
  body.style.width = '100%';
  body.style.height = '100%';
  body.style.position = 'fixed';
  const css = `
    .livetlButtonWrapper a.ytd-toggle-button-renderer:hover {
      background-color: #0099ffb5 !important;
    }
    .livetlButtonWrapper a.ytd-toggle-button-renderer {
      transition: 0.1s;
    }
  `;
  const style = document.createElement('style');
  style.innerHTML = css;
  body.appendChild(style);

  const frameInfo = await getFrameInfoAsync();
  window.parent.postMessage({ type: 'frameInfo', frameInfo: frameInfo }, '*');

  if (document.querySelector('.livetlButtonWrapper')) {
    console.debug('LTL buttons already injected. Skipping injection');
    return;
  }

  if (paramsEmbedDomain === chrome.runtime.id) {
    console.debug('Chat is in extension, not injecting LTL buttons.');
    return;
  }

  const openLiveTL = () => {
    window.top.location =
      chrome.runtime.getURL(`watch.html?${constructParams()}`);
  };
  const tlPopout = () => {
    const popoutParams = constructParams();
    popoutParams.set('popout', true);
    popoutParams.set('tabid', frameInfo.tabId);
    popoutParams.set('frameid', frameInfo.frameId);
    try{
      popoutParams.set(
        'title',
        window.parent.document.querySelector('#container > .title').textContent
      );
    }
    catch (e) {
      if (e instanceof DOMException) {
        console.debug('Ignored expected CORS error', { e });
      }
      else {
        throw e;
      }
    }
    createPopup(
      chrome.runtime.getURL(`popout.html?${popoutParams}`)
    );
  };
  const embedTLs = () => {
    const embeddedParams = constructParams();
    embeddedParams.set('embedded', true);
    embeddedParams.set('tabid', frameInfo.tabId);
    embeddedParams.set('frameid', frameInfo.frameId);
    document.body.outerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'fixed';
    iframe.src = chrome.runtime.getURL(`watch.html?${embeddedParams}`);
    iframe.id = 'ltl-embed';
    document.body.appendChild(iframe);
    const onMessage = d => {
      iframe.contentWindow.postMessage(d.data, '*');
    };
    window.addEventListener('message', onMessage);
    iframe.cleanUp = () => window.removeEventListener('message', onMessage);
  };

  switch (autoLaunchMode.get()) {
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

  /** Start buttons injections */
  makeButton('Open LiveTL', openLiveTL, undefined, mdiYoutubeTv);
  makeButton('TL Popout', tlPopout, undefined, mdiOpenInNew);
  makeButton('Embed TLs', embedTLs, undefined, mdiIframeArray);
}

const closeEmbedTl = () => {
  document.querySelectorAll('#ltl-embed').forEach(iframe => iframe?.cleanUp());
  window.location.href = window.location.href;
};

window.addEventListener('message', (packet) => {
  if (packet.origin !== window.origin && !packet.data.type) window.postMessage(packet.data);
  switch (packet?.data?.type) {
  case PostMessage.CLOSE_EMBED:
    closeEmbedTl();
  }
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
