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

// chrome.webRequest.onHeadersReceived.addListener(
//   details => {
//     // PROGRESS: firefox doesn't allow stripping x-frame-options in mv3 (see mv3-howto.md
//     if (details.url.includes('/live_chat') && details.responseHeaders.some(header => header.name.toLowerCase() === 'x-frame-options')) {
//       console.log('STRIPPING', details.responseHeaders, stripHeaders(details.responseHeaders));
//     }
//     return {
//       responseHeaders: stripHeaders(details.responseHeaders)
//     };
//   }, {
//     urls: [
//       '<all_urls>'
//     ]
//   }, ['blocking', 'responseHeaders']);
