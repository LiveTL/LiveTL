import './storage-promise-compat';
import '../../submodules/chat/src/scripts/chat-background.ts';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') { chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') }); }
});

const stripHeaders = (headers) => {
  return headers.filter(header => {
    const headerName = header.name.toLowerCase();
    return !(headerName === 'content-security-policy' ||
      headerName === 'x-frame-options');
  });
};

if (__MV__ === 2) {
  chrome.webRequest.onHeadersReceived.addListener(
    details => ({ responseHeaders: stripHeaders(details.responseHeaders) }),
    { urls: ['<all_urls>'] },
    ['blocking', 'responseHeaders']
  );

  browser.webRequest.onBeforeSendHeaders.addListener(
    details => {
      details.requestHeaders.push({ name: 'Referer', value: 'https://youtu.be' });
      return { requestHeaders: details.requestHeaders };
    },
    { urls: ['*://*.youtube.com/embed/*'] },
    ['blocking', 'requestHeaders']
  );
}
