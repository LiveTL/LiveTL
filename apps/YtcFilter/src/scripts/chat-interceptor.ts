import { parseMessageRuns } from '../ts/chat-parser';
import { fixLeaks } from '../ts/ytc-fix-memleaks';
import { stringifyRuns } from '../ts/ytcf-utils';

if (!window.location.href.includes('/embed/ytcfilter_embed')) {
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

  try {
    const video = (window as any).parent.ytInitialData.contents.twoColumnWatchNextResults.results.results.contents[0]
      .videoPrimaryInfoRenderer;
    const channel = (window as any).parent.ytInitialData.contents.twoColumnWatchNextResults.results.results.contents[1]
      .videoSecondaryInfoRenderer.owner.videoOwnerRenderer;
    const params = new URLSearchParams(window.parent.location.search);
    window.dispatchEvent(
      new CustomEvent('videoInfoYtcFilter', {
        detail: JSON.stringify({
          video: {
            title: stringifyRuns(parseMessageRuns(video.title.runs)),
            videoId: video.updatedMetadataEndpoint?.updatedMetadataEndpoint?.videoId || params.get('v'),
          },
          channel: {
            channelId: channel.navigationEndpoint.browseEndpoint.browseId,
            handle: channel.navigationEndpoint.browseEndpoint.canonicalBaseUrl.split('/@')[1],
            name: stringifyRuns(parseMessageRuns(channel.title.runs)),
          },
        }),
      }),
    );
  } catch (e) {
    const videoId = new URLSearchParams(window.location.search).get('v');
    window.dispatchEvent(
      new CustomEvent('videoInfoYtcFilter', {
        detail: JSON.stringify(
          videoId !== null
            ? {
                video: {
                  videoId,
                },
              }
            : null,
        ),
      }),
    );
  }

  fixLeaks();
}
