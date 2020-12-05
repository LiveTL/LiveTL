const launch = () => chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });

chrome.runtime.onInstalled.addListener(launch);
chrome.browserAction.onClicked.addListener(launch);

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  switch (request.type) {
    case 'window':
      chrome.windows.create(request.data, callback);
      break;
    case 'tab':
      chrome.tabs.create(request.data);
      break;
    case 'redirect':
      chrome.tabs.update(request.data);
      break;
    case 'get_war':
      callback(chrome.runtime.getURL(request.url));
      break;
    case 'postMessageToWindow':
      chrome.tabs.sendMessage(request.id, callback);
      break;
  }
});

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    return {
      responseHeaders: details.responseHeaders.filter(header => {
        return (header.name.toLowerCase() !== 'x-frame-options');
      })
    };
  }, {
  urls: ["<all_urls>"]
}, ["blocking", "responseHeaders"]);