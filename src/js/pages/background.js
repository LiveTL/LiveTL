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

// Fixes #478 - embed view does not work without a proper referer
// youtu.be can be anything just not empty
// stick to youtu.be to make youtube think this is just a redirect
browser.webRequest.onBeforeSendHeaders.addListener(
  details => {
    const headers = details.requestHeaders;
    headers.push({ name: 'Referer', value: 'https://youtu.be' });
    return { requestHeaders: headers };
  },
  { urls: ['*://*.youtube.com/embed/*'] },
  ['blocking', 'requestHeaders']
);
