// TODO: Remove when fully migrated
export function sendToBackground(data) {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => chrome.runtime.sendMessage(data, resolve));
}

export function openWindow(url) {
  return sendToBackground({
    type: 'window',
    url
  });
}
