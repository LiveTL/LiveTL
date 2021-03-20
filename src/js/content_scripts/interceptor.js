import {parseChatResponse} from '../parse-chat.js';

const messageReceiveCallback = async (response) => {
  response = JSON.parse(response);
  try {
    const chunk = parseChatResponse(response);
    window.parent.postMessage(chunk, '*');
  } catch (e) {
    console.debug(e);
  }
};
  
const chatLoaded = async () => {
  const script = document.createElement('script');
  script.innerHTML = `
    for (event_name of ["visibilitychange", "webkitvisibilitychange", "blur"]) {
      window.addEventListener(event_name, event => {
        event.stopImmediatePropagation();
      }, true);
    }
    window.fetchFallback = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0].url;
      const result = await window.fetchFallback(...args);
      if (url.startsWith(
        'https://www.youtube.com/youtubei/v1/live_chat/get_live_chat')
      ) {
        const response = JSON.stringify(await (await result.clone()).json());
        window.dispatchEvent(new CustomEvent('messageReceive', { detail: response }));
      }
      return result;
    };
  `;
  window.addEventListener('messageReceive', d => messageReceiveCallback(d.detail));
  document.body.appendChild(script);
};
  
window.addEventListener('load', chatLoaded);
if (document.readyState === 'complete') chatLoaded();