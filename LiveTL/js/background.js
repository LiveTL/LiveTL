const launch = () => chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });

const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));

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
    if (isSafari) {
      //don't show is safari
      console.debug("This is a first install!");
      chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  switch (request.type) {
    case 'get_war': {
      callback(chrome.runtime.getURL(request.url));
      break;
    } case 'message': {
      try {
        console.debug('Broadcasting message', request.data);
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, request.data);
          });
        });
      } catch (e) { }
      break;
    } case 'window': {
      (window.browser || window.chrome).windows.create({
        url: request.url,
        type: 'popup',
        height: 300,
        width: 600
      });
    }
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