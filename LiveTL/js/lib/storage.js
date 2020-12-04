async function getStorage(key) {
  return await browser.storage.local.get(key).then(p => p[key]);
}

async function setStorage(key, value) {
  let obj = {}
  obj[key] = value;
  return await browser.storage.local.set(obj);
}

