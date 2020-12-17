const launch = () => chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });
const YT_URLS = [
  "https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?*",
  "https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?*"
];

const changes = () => {
  let v = chrome.runtime.getManifest().version;
  chrome.tabs.create({ url: `https://kentonishi.github.io/LiveTL/changelogs?version=v${v}` });
  chrome.browserAction.onClicked.addListener(launch);
  chrome.browserAction.setIcon({
    path: "./icons/128x128.png"
  });
  chrome.browserAction.onClicked.removeListener(changes);
}

chrome.browserAction.onClicked.addListener(launch);

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason == "update") {
    //didUpdate = true;
    let thisVersion = chrome.runtime.getManifest().version;
    console.debug("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    chrome.browserAction.setIcon({
      path: "./icons/notification_128x128.png"
    });
    chrome.browserAction.onClicked.removeListener(launch);
    chrome.browserAction.onClicked.addListener(changes);
  } else {
    console.debug("This is a first install!");
    chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });
  }
});

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  switch (request.type) {
    case 'get_war':
      callback(chrome.runtime.getURL(request.url));
      break;
    case 'message':
      try {
        chrome.tabs.sendMessage(
          request.id, request.data
        );
      } catch (e) { }
      break;
    case 'window':
      (window.browser || window.chrome).windows.create({
        url: request.url,
        type: 'popup',
        height: 300,
        width: 600
      }).then(tab => {
        console.debug('Created window', tab);
        callback(tab.id);
      });
      return true;
    // can't break here, callback breaks 
  }
});

function stripHeaders(headers) {
  return headers.filter(header => {
    let headerName = header.name.toLowerCase();
    return !(headerName === 'content-security-policy'
      || headerName === 'x-frame-options');
  })
}

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    return {
      responseHeaders: stripHeaders(details.responseHeaders)
    };
  }, {
  urls: [
    "<all_urls>"
  ]
}, ["blocking", "responseHeaders"]);


isLiveTL = details => {
  let livetl = false;
  details.requestHeaders = (details.requestHeaders || []).reduce((arr, h) => {
    if (h.name == 'livetl') {
      livetl = true;
    } else if (h.name != 'X-Origin') {
      arr.push(h);
    }
    return arr;
  }, []);
  return livetl;
};

let mostRecentBodies = {};

chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    if (!isLiveTL(details)) {
      // console.debug(details.tabId);
      try {
        chrome.tabs.sendMessage(
          details.tabId, { url: details.url, headers: details.requestHeaders, body: mostRecentBodies[details.url] }
        );
      } catch (e) {
        console.debug(e);
      }
    }
  }, {
  urls: YT_URLS
}, ["requestHeaders"]);

chrome.webRequest.onBeforeRequest.addListener(
  details => {
    mostRecentBodies[details.url] = decodeURIComponent(String.fromCharCode.apply(null,
      new Uint8Array(details.requestBody.raw[0].bytes)));
  }, {
  urls: YT_URLS
}, ["requestBody"]);