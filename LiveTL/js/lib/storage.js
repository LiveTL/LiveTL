async function isNewUser(id) {
  return allTranslators.byID[id] == null;
}

async function isChecked(userid) {
  return (await getUserStatus(userid)).checked;
}

async function saveUserStatus(userid, checked, addedByUser, byname) {
  return await setStorage(`user${(byname ? 'byname' : '')}_${userid}`, { checked, addedByUser });
}

async function getUserStatus(userid, byname) {
  return (await getStorage(`user${(byname ? 'byname' : '')}_${userid}`)) || {};
}

async function getUserStatusAsBool(id) {
  let status = await getUserStatus(id);
  status = status.checked != null ? status.checked : allTranslatorCheckbox.checked;
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

async function setupDefaultCaption() {
  if ((await getStorage('captionMode')) == null) {
    return await setStorage('captionMode', true);
  }
};

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

if (isAndroid) {
  storage.get = async key => {
    let data = {};
    try {
      data[key] = JSON.parse(localStorage[key]) || null;
    } catch (e) {
      data[key] = localStorage[key] || null;
    }
    return data;
  }
  storage.set = async obj => {
    let key = Object.keys(obj)[0];
    localStorage[key] = JSON.stringify(obj[key]);
  }
} else if (isFirefox) {
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

