import { isAndroid, isFirefox, speechSynthDefault } from './web-constants.js';

export async function isNewUser(id) {
  return allTranslators.byID[id] == null;
}

// async function isChecked(userid) {
//   return (await getUserStatus(userid)).checked;
// }
// Not sure how the next line worked
// let isChecked = getUserStatusAsBool;
// same function, deprecated and should be moved

export async function saveUserStatus(userid, checked, addedByUser, byname) {
  if (byname) updateJSON('customUsers', d => {
    d[userid] = {
      enabled: true
    };
  });
  return await setStorage(`user${(byname ? 'byname' : '')}_${userid}`, { checked, addedByUser });
}

export async function resetUserStatus(userid, byname) {
  if (byname) updateJSON('customUsers', d => {
    d[userid] = undefined;
  });
  return await setStorage(`user${(byname ? 'byname' : '')}_${userid}`, { checked: null, addedByUser: null });
}

export async function getUserStatus(userid, byname) {
  return (await getStorage(`user${(byname ? 'byname' : '')}_${userid}`)) || {};
}

export async function getUserStatusAsBool(id) {
  let status = await getUserStatus(id);
  status = status.checked != null ? status.checked : allTranslatorCheckbox.checked;
  return status;
}

export async function getDefaultLanguage() {
  let lang = await getStorage('LTL:defaultLang');
  if (lang) {
    return lang.lang;
  }
}

export async function setDefaultLanguage(lang) {
  return await setStorage('LTL:defaultLang', { lang });
}

export async function setDefaultSetting(setting, value) {
  if (await getStorage(setting) == null) {
    return await setStorage(setting, value);
  }
}

export async function setupDefaultCaption() {
  await setDefaultSetting('captionMode', true);
}

export async function setupDefaultCaptionDelay() {
  await setDefaultSetting('captionDelay', -1);
}

export async function setupDefaultSpeechSynth() {
  return await setDefaultSetting('speechSynth', speechSynthDefault);
}

/*
async function setupDefaultTranslatorMode() {
  return await setDefaultSetting('translatorMode', TranslatorMode.defaultt);
}
 */

export async function getSpeechVolume() {
  return await getStorage('speechVolume');
}

export async function setSpeechVolume(volume) {
  return await setStorage('speechVolume', volume);
}

export async function getCaptionZoom() {
  await setDefaultSetting('captionZoom', isAndroid ? 0.5 : 1);
  return await getStorage('captionZoom');
}

export async function setCaptionZoom(value) {
  return await setStorage('captionZoom', value);
}

export async function getStorage(key) {
  const result = await storage.get(key);
  return result ? result[key] : result;
}

export async function setStorage(key, value) {
  let obj = {}
  obj[key] = value;
  return await storage.set(obj);
}

export async function getJSON(name) {
  window[name] = await JSON.parse((await getStorage(name)) || '{}');
  return window[name];
}

export async function setJSON(name, value) {
  window[name] = value;
  const val = JSON.stringify(value);
  return await setStorage(name, val);
}

export async function updateJSON(name, callback) {
  let data = await getJSON(name);
  await callback(data);
  await setJSON(name, data);
}

export const isChecked = getUserStatusAsBool;

export const storage = {
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

/*
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
  getJSON,
  setJSON,
  updateJSON,
  resetUserStatus,
  storage
};
*/
