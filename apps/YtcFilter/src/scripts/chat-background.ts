import { isLiveTL } from '../ts/chat-constants';
import { popoutDims } from '../ts/storage';
const noUpdateKeys = new Set(['ytcf.bytes.used', 'ytcf.bytes.update']);
const oneDay = 1000 * 60 * 60 * 24;

const storageget = (key: string): any => chrome.storage.local.get(key).then(r => r[key]);
const defaultTo0 = (value: any): number => Number.isNaN(value) ? 0 : value;

chrome.action.onClicked.addListener(() => {
  if (isLiveTL) {
    chrome.tabs.create({ url: 'https://livetl.app' }, () => {});
  } else {
    chrome.tabs.create({ url: '/options.html' }, () => {});
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getFrameInfo') {
    sendResponse({ tabId: sender.tab?.id, frameId: sender.frameId });
  } else if (request.type === 'createPopup') {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    popoutDims.ready().then(() => {
      const vals = popoutDims.getCurrent();
      try {
        chrome.windows.create({
          url: request.url,
          type: 'popup',
          ...vals
        }, () => {});
      } catch (e) {
        chrome.windows.create({
          url: request.url,
          type: 'popup'
        }, () => {});
      }
    });
  }
});

chrome.runtime.onConnect.addListener(hc => {
  const { frameId, tabId } = JSON.parse(hc.name) as { frameId: number, tabId: number };
  const interceptorPort = chrome.tabs.connect(tabId, { frameId });

  const onInterceptorMessage = (msg: any): void => {
    hc.postMessage(msg);
  };
  interceptorPort.onMessage.addListener(onInterceptorMessage);
  interceptorPort.onDisconnect.addListener(() => {
    interceptorPort.onMessage.removeListener(onInterceptorMessage);
    hc.onMessage.removeListener(onHcMessage);
    try {
      hc.disconnect();
    } catch (error) {
    }
  });

  const onHcMessage = (msg: any): void => {
    interceptorPort.postMessage(msg);
  };
  hc.onMessage.addListener(onHcMessage);
  hc.onDisconnect.addListener(() => {
    hc.onMessage.removeListener(onHcMessage);
    interceptorPort.onMessage.removeListener(onInterceptorMessage);
    try {
      interceptorPort.disconnect();
    } catch (error) {
    }
  });
});

// see https://i.imgur.com/cGciqrX.png
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  let delta = 0;
  for (const key of Object.keys(changes)) {
    if (noUpdateKeys.has(key)) continue;
    const { oldValue, newValue } = changes[key];
    delta += oldValue === undefined
      ? (key + JSON.stringify(newValue)).length
      : JSON.stringify(newValue).length - JSON.stringify(oldValue).length;
  }
  if (delta === 0) return;

  // avoid top-level async
  // see https://stackoverflow.com/a/53024910
  (async () => {
    const toWrite: Record<string, any> = {};
    const data = await Promise.all([
      storageget('ytcf.bytes.used'),
      storageget('ytcf.bytes.lastupdate')
    ]);
    let bytesused = defaultTo0(data[0]);
    const lastupdate = defaultTo0(data[1]);
    const now = Date.now();

    // see https://i.imgur.com/S0i9oS4.png
    //     https://i.imgur.com/PpBepQ0.png
    if (now - lastupdate >= oneDay) {
      // see https://bugzilla.mozilla.org/show_bug.cgi?id=1385832#c20
      bytesused = new TextEncoder().encode(
        Object.entries(await chrome.storage.local.get())
          .map(([key, value]) => key + JSON.stringify(value))
          .join('')
      ).length;
      toWrite['ytcf.bytes.lastupdate'] = now;
    }

    // storage transaction with 2 awaits -> potential data race???
    toWrite['ytcf.bytes.used'] = bytesused + delta;
    await chrome.storage.local.set(toWrite);
  })();
  return true;
});
