const launch = () => chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });

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
    console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    chrome.browserAction.setIcon({
      path: "./icons/notification_128x128.png"
    });
    chrome.browserAction.onClicked.removeListener(launch);
    chrome.browserAction.onClicked.addListener(changes);
  } else {
    console.log("This is a first install!");
    chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });
  }
});

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  switch (request.type) {
    case 'get_war':
      callback(chrome.runtime.getURL(request.url));
      break;
  }
});

function stripHeaders(headers) {
  return headers.filter(header => {
    let headerName = header.name.toLowerCase();
    return !(headerName === 'content-security-policy' || headerName === 'x-frame-options');
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

chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    console.log(details);
    let livetl = false;
    details.requestHeaders.filter(h => {
      if (h.name == 'livetl') {
        livetl = true;
        return false;
      }
      return true;
    });
    if ((details.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") ||
      details.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay")) &&
      !livetl) {
      chrome.tabs.sendMessage(
        details.tabId, { url: details.url, headers: details.requestHeaders }
      );
    }
  }, {
  urls: [
    "<all_urls>"
  ]
}, ["requestHeaders", "extraHeaders"]);