import { fixLeaks } from '../ts/ytc-fix-memleaks';

for (const eventName of ['visibilitychange', 'webkitvisibilitychange', 'blur']) {
  window.addEventListener(
    eventName,
    (event) => {
      event.stopImmediatePropagation();
    },
    true,
  );
}

const fetchFallback = window.fetch;
(window as any).fetchFallback = fetchFallback;
window.fetch = async (...args) => {
  const result = await fetchFallback(...args);

  // fetch accepts Request, URL, and string inputs (including relative URLs).
  // Observing chat responses must never turn a successful YouTube request into
  // a rejected promise, even when the response is not JSON.
  try {
    const input = args[0];
    const url = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      location.href,
    );
    const currentDomain = location.protocol + '//' + location.host;
    const ytApi = (end: string): string => `${currentDomain}/youtubei/v1/live_chat${end}`;
    const isReceiving = url.href.startsWith(ytApi('/get_live_chat'));
    const isSending = url.href.startsWith(ytApi('/send_message'));
    const action = isReceiving ? 'messageReceive' : 'messageSent';
    if (isReceiving || isSending) {
      const response = JSON.stringify(await result.clone().json());
      window.dispatchEvent(new CustomEvent(action, { detail: response }));
    }
  } catch (error) {
    console.debug('Could not observe chat response', error);
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
    window.dispatchEvent(
      new CustomEvent('proxyFetchResponse', {
        detail: JSON.stringify({
          id: payload.id,
          response,
        }),
      }),
    );
  } catch (error) {
    window.dispatchEvent(
      new CustomEvent('proxyFetchResponse', {
        detail: JSON.stringify({
          id: payload.id,
          error: String(error),
        }),
      }),
    );
  }
});

fixLeaks();
