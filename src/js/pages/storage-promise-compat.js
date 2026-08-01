if (__MV__ === 2) {
  const get = chrome.storage.local.get.bind(chrome.storage.local);
  const set = chrome.storage.local.set.bind(chrome.storage.local);

  chrome.storage.local.get = (keys, callback) => callback == null
    ? new Promise(resolve => get(keys ?? null, resolve))
    : get(keys, callback);
  chrome.storage.local.set = (items, callback) => callback == null
    ? new Promise(resolve => set(items, resolve))
    : set(items, callback);
}
