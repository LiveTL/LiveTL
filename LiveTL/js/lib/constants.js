export const languages = [
  { code: 'en', name: 'English', lang: 'English' },
  { code: 'jp', name: 'Japanese', lang: '日本語' },
  { code: 'es', name: 'Spanish', lang: 'Español' },
  { code: 'id', name: 'Indonesian', lang: 'bahasa Indonesia' },
  { code: 'kr', name: 'Korean', lang: '한국' },
  { code: 'ch', name: 'Chinese', lang: '中文' },
  { code: 'ru', name: 'Russian', lang: 'русский' },
  { code: 'fr', name: 'French', lang: 'Français' }
];

try {
  window.customTags = window.customTags || {};
  window.customUsers = window.customUsers || {};
  window.getWAR = getWAR
} catch (e) { }

const languageConversionTable = {};

// WAR: web accessible resource
export async function getWAR(u) {
  return await new Promise((res, rej) => {
    if (isAndroid) {
      if(window.isChat && window.isChat()) {
        res(`CUSTOMJS/${u}`);
      } else {
        res(`file:///android_asset/${u}`);
      }
    } else {
      chrome.runtime.sendMessage({ type: 'get_war', url: u }, r => res(r));
    }
  });
}

export async function getFile(name, format) {
  return await (await fetch(await getWAR(name)))[format]();
}

export function decodeURIComponentSafe(s) {
  if (!s) {
    return s;
  }
  return decodeURIComponent(s.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
}

// module.exports = { getFile, getWAR, languages, decodeURIComponentSafe };
