export const storageVersion = 'v0-alpha';

/** @enum {String} */
export const VideoSide = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP'
};

/** @enum {String} */
export const ChatSplit = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
};

/** @enum {String} */
export const TextDirection = {
  TOP: 'TOP',
  BOTTOM: 'BOTTOM'
};

// Js enum omegalul
/** @enum {number} */
export const Browser = {
  FIREFOX: 0,
  CHROME: 1,
  SAFARI: 2,
  ANDROID: 3
};

export const BROWSER = (() => {
  if (/Firefox/.exec(navigator.userAgent)) {
    return Browser.FIREFOX;
  }
  if (window.isAndroid || window.chrome == null) {
    return Browser.ANDROID;
  }
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    return Browser.SAFARI;
  }
  return Browser.CHROME;
})();

/** @enum {Number} */
export const AuthorType = {
  moderator: 1 << 0,
  verified: 1 << 1,
  owner: 1 << 2,
  member: 1 << 3,
  mchad: 1 << 4,
  api: 1 << 5
};

export const languages = [
  { code: 'en', name: 'English', lang: 'English', tag: 'en-US' },
  { code: 'jp', name: 'Japanese', lang: '日本語', tag: 'jp-JP' },
  { code: 'es', name: 'Spanish', lang: 'Español', tag: 'es-MX' },
  { code: 'id', name: 'Indonesian', lang: 'Bahasa Indonesia', tag: 'id-ID' },
  { code: 'kr', name: 'Korean', lang: '한국', tag: 'ko-KR' },
  { code: 'ch', name: 'Chinese', lang: '中文', tag: 'zh-CN' },
  { code: 'ru', name: 'Russian', lang: 'русский', tag: 'ru-RO' },
  { code: 'fr', name: 'French', lang: 'Français', tag: 'fr-FR' }
];

export const languageConversionTable = {};
export const languageNameCode = {};
export const languageNameValues = languages.map(lang => ({
  name: createLangSelectionName(lang), value: lang.lang
}));

function createLangSelectionName(lang) {
  return `${lang.name} (${lang.lang})`;
}

languages.forEach(i => languageConversionTable[createLangSelectionName(i)] = i);
languages.forEach(lang => languageNameCode[lang.lang] = lang);

export const MCHAD = 'http://157.230.241.238';

export const videoId = new URLSearchParams(window.location.search ?? '').get('video');
