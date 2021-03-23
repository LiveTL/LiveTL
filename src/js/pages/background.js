/* eslint-disable no-undef */
import '../../img/icon-128.png';
import '../../img/icon-34.png';

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  switch (request.type) {
  case 'tabid': {
    callback(sender.tab.id);
    break;
  } case 'message': {
    try {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, request.data);
        });
      });
    // eslint-disable-next-line no-empty
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