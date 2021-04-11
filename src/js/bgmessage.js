/* eslint-disable no-undef */

export function sendToBackground(data) {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => chrome.runtime.sendMessage(data, resolve));
}

export function openWindow(url) {
  sendToBackground({
    type: 'window',
    url
  });
}
