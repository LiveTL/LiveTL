function isNewUser(id) {
  return allTranslators[id] == null;
}

async function isChecked(userid) {
  return (await getUserStatus(userid)).checked;
}

async function saveUserStatus(userid) {
  return await setStorage('user_' + userid, allTranslators[userid]);
}

async function getUserStatus(userid) {
  return (await getStorage('user_' + userid)) || {};
}

async function getUserStatusAsBool(id) {
  let status = await getUserStatus(id);
  status = status.checked != null ? status.checked : true;
  return status;
}

async function getDefaultLanguage() {
  let lang = await getStorage('LTL:defaultLang');
  if (lang) {
    return lang.lang;
  }
}

async function setDefaultLanguage(lang) {
  return await setStorage('LTL:defaultLang', { lang });
}

async function getStorage(key) {
  const result = await storage.get(key);
  return result ? result[key] : result;
}

async function setStorage(key, value) {
  let obj = {}
  obj[key] = value;
  return await storage.set(obj);
}

let storage = {
  get: key => null,
  set: obj => null
};

if (isFirefox) {
  storage.get = async (key) => {
    return await browser.storage.local.get(key);
  };

  storage.set = async (obj) => {
    return await browser.storage.local.set(obj);
  };
} else {
  storage.get = (key) => {
    return new Promise((res, rej) => {
      chrome.storage.local.get(key, res)
    });
  };

  storage.set = (obj) => {
    return new Promise((res, rej) => {
      chrome.storage.local.set(obj, res);
    })
  };
}

