async function isNewUser(id) {
  return allTranslators.byID[id] == null;
}

// async function isChecked(userid) {
//   return (await getUserStatus(userid)).checked;
// }
// Not sure how the next line worked
// let isChecked = getUserStatusAsBool;
// same function, deprecated and should be moved

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

async function setDefaultSetting(setting, value) {
  if (await getStorage(setting) == null) {
    return await setStorage(setting, value);
  }
}

async function setupDefaultCaption() {
  await setDefaultSetting('captionMode', true);
}

async function setupDefaultCaptionDelay() {
  await setDefaultSetting('captionDelay', -1);
}

async function setupDefaultSpeechSynth() {
  return await setDefaultSetting('speechSynth', speechSynthDefault);
}

async function setupDefaultTranslatorMode() {
  return await setDefaultSetting('translatorMode', TranslatorMode.defaultt);
}

async function getSpeechVolume() {
  return await getStorage('speechVolume');
}

async function setSpeechVolume(volume) {
  return await setStorage('speechVolume', volume);
}

async function getCaptionZoom() {
  await setDefaultSetting('captionZoom', isAndroid ? 0.5 : 1);
  return await getStorage('captionZoom');
}

async function setCaptionZoom(value) {
  return await setStorage('captionZoom', value);
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

const isChecked = getUserStatusAsBool;

const storage = {
  get: key => null,
  set: obj => null
};

if (isAndroid) {
  storage.get = async key => {
    let data = {};
    try {
      data[key] = JSON.parse(localStorage[key]);
    } catch (e) {
      data[key] = localStorage[key];
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

module.exports = {
  isNewUser,
  saveUserStatus,
  getUserStatus,
  getUserStatusAsBool,
  getDefaultLanguage,
  setDefaultLanguage,
  setDefaultSetting,
  setupDefaultCaption,
  setupDefaultCaptionDelay,
  setupDefaultSpeechSynth,
  setupDefaultTranslatorMode,
  getCaptionZoom,
  setCaptionZoom,
  getStorage,
  setStorage,
  isChecked,
  storage
};
