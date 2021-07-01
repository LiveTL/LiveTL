import '../../img/128x128.png';
import '../../img/48x48.png';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason != 'update')
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
});

chrome.runtime.onMessage.addListener((request) => {
  switch (request.type) {
  case 'window': {
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

const stripHeaders = (headers)=> {
  return headers.filter(header => {
    let headerName = header.name.toLowerCase();
    return !(headerName === 'content-security-policy'
      || headerName === 'x-frame-options');
  });
};

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    return {
      responseHeaders: stripHeaders(details.responseHeaders)
    };
  }, {
    urls: [
      '<all_urls>'
    ]
  }, ['blocking', 'responseHeaders']);
