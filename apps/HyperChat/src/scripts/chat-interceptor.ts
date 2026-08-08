import { fixLeaks } from '../ts/ytc-fix-memleaks';

for (const eventName of ['visibilitychange', 'webkitvisibilitychange', 'blur']) {
  window.addEventListener(eventName, event => {
    event.stopImmediatePropagation();
  }, true);
}

const fetchFallback = window.fetch;
(window as any).fetchFallback = fetchFallback;
window.fetch = async (...args) => {
  const request = args[0] as Request;
  const url = request.url;
  const result = await fetchFallback(...args);

  const currentDomain = (location.protocol + '//' + location.host);
  const ytApi = (end: string): string => `${currentDomain}/youtubei/v1/live_chat${end}`;
  const isReceiving = url.startsWith(ytApi('/get_live_chat'));
  const isSending = url.startsWith(ytApi('/send_message'));
  const action = isReceiving ? 'messageReceive' : 'messageSent';
  if (isReceiving || isSending) {
    const response = JSON.stringify(await (result.clone()).json());
    window.dispatchEvent(new CustomEvent(action, { detail: response }));
  }
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-misused-promises
window.addEventListener('proxyFetchRequest', async (event) => {
  const payload = JSON.parse((event as any).detail as string) as {
    id: string;
    args: [string, any];
  };
  try {
    const request = await fetchFallback(...payload.args);
    const response = await request.json();
    window.dispatchEvent(new CustomEvent('proxyFetchResponse', {
      detail: JSON.stringify({
        id: payload.id,
        response
      })
    }));
  } catch (error) {
    window.dispatchEvent(new CustomEvent('proxyFetchResponse', {
      detail: JSON.stringify({
        id: payload.id,
        error: String(error)
      })
    }));
  }
});

fixLeaks();
