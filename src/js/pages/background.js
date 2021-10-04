import '../../img/128x128.png';
import '../../img/48x48.png';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'update') { chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') }); }
});

const stripHeaders = (headers) => {
  return headers.filter(header => {
    const headerName = header.name.toLowerCase();
    return !(headerName === 'content-security-policy' ||
      headerName === 'x-frame-options');
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
