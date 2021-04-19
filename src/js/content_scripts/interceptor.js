import {parseChatResponse} from '../parse-chat.js';
import { sendToBackground } from '../bgmessage.js';

let tabid = -1;

const messageReceiveLiveTLSvelteCallback = async (response) => {
  response = JSON.parse(response);
  try {
    let chunk = parseChatResponse(response);
    chunk.tabid = tabid;
    window.parent.postMessage(chunk, '*');
    sendToBackground({
      type: 'message',
      data: chunk
    });
  } catch (e) {
    console.debug(e);
  }
};
  
const chatLoaded = async () => {
  tabid = await sendToBackground({
    type:'tabid'
  });
  const script = document.createElement('script');
  script.innerHTML = `
    for (event_name of ["visibilitychange", "webkitvisibilitychange", "blur"]) {
      window.addEventListener(event_name, event => {
        event.stopImmediatePropagation();
      }, true);
    }
    window.fetchFallbackLiveTLSvelte = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0].url;
      const result = await window.fetchFallbackLiveTLSvelte(...args);
      if (url.startsWith(
        'https://www.youtube.com/youtubei/v1/live_chat/get_live_chat')
      ) {
        const response = JSON.stringify(await (await result.clone()).json());
        window.dispatchEvent(new CustomEvent('messageReceiveLiveTLSvelte', { detail: response }));
      }
      return result;
    };
  `;
  window.addEventListener('messageReceiveLiveTLSvelte', d => messageReceiveLiveTLSvelteCallback(d.detail));
  document.body.appendChild(script);
};
  
window.addEventListener('load', chatLoaded);
if (document.readyState === 'complete') chatLoaded();