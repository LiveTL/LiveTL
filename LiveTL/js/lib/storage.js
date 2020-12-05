async function getStorage(key) {
  const result = await browser.storage.local.get(key);
  return result ? result[key] : result;
}

async function setStorage(key, value) {
  let obj = {}
  obj[key] = value;
  return await browser.storage.local.set(obj);
}

async function isChecked(userid) {
  const status = await getStorage(userid);
  if (status) {
    return status.checked;
  }
  const allCheckmark = await getStorage('allTranslatorID');
  return allCheckmark ? allCheckmark.checked : true;
}

async function saveUserStatus(userid, checked) {
  return await setStorage(userid, { checked });
}

