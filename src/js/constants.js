export const isAndroid = false;
// DO NOT EDIT THE ABOVE LINE, it will be updated by webpack.
export const storageVersion = 'v0-alpha';

/** @enum {String} */
export const VideoSide = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP'
};

export const videoSideMap = new Map([
  [VideoSide.LEFT, 'Left'],
  [VideoSide.RIGHT, 'Right'],
  [VideoSide.TOP, 'Top']
]);

/** @enum {String} */
export const ChatSplit = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
};

/** @enum {String} */
export const SelectOperation = {
  SCREENSHOT: 'SCREENSHOT',
  DOWNLOAD: 'DOWNLOAD'
};

export const chatSplitMap = new Map([
  [ChatSplit.HORIZONTAL, 'Horizontal'],
  [ChatSplit.VERTICAL, 'Vertical']
]);

/** @enum {String} */
export const TextDirection = {
  TOP: 'TOP',
  BOTTOM: 'BOTTOM'
};

export const textDirectionMap = new Map([
  [TextDirection.TOP, 'Top'],
  [TextDirection.BOTTOM, 'Bottom']
]);

/** @enum {String} */
export const DisplayMode = {
  POPOUT: 'POPOUT',
  EMBEDDED: 'EMBEDDED',
  FULLPAGE: 'FULL PAGE'
};

/** @enum {String} */
export const AutoLaunchMode = {
  NONE: 'NONE',
  ...DisplayMode
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// This was causing circular dependency when exported in utils.js
const transformOpt = str =>
  capitalize(str
    .trim()
    .toLowerCase());

export const autoLaunchModeItems = Object.keys(AutoLaunchMode).map(item => ({
  text: transformOpt(AutoLaunchMode[item]),
  value: AutoLaunchMode[item]
}));

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
  if (isAndroid || window.chrome == null) {
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

export const GIGACHAD =
  AuthorType.moderator | AuthorType.owner | AuthorType.mchad | AuthorType.api;

export const languages = [
  { code: 'en', name: 'English', lang: 'English', tag: 'en-US' },
  { code: 'jp', name: 'Japanese', lang: '日本語', tag: 'jp-JP' },
  { code: 'es', name: 'Spanish', lang: 'Español', tag: 'es-MX' },
  { code: 'id', name: 'Indonesian', lang: 'Bahasa Indonesia', tag: 'id-ID' },
  { code: 'kr', name: 'Korean', lang: '한국어', tag: 'ko-KR' },
  { code: 'ch', name: 'Chinese', lang: '中文', tag: 'zh-CN' },
  { code: 'ru', name: 'Russian', lang: 'русский', tag: 'ru-RO' },
  { code: 'fr', name: 'French', lang: 'Français', tag: 'fr-FR' }
];

export const languageConversionTable = {};
export const languageNameCode = {};
export const languageNameValues = languages.map(lang => ({
  text: createLangSelectionName(lang), value: lang.lang
}));

function createLangSelectionName(lang) {
  return `${lang.name} (${lang.lang})`;
}

languages.forEach(i => (languageConversionTable[createLangSelectionName(i)] = i));
languages.forEach(lang => (languageNameCode[lang.lang] = lang));

export const MCHAD = 'https://repo.mchatx.org';

const params = new URLSearchParams(window.location.search);
export const paramsYtVideoId = params.get('ytVideo');
export const paramsPopout = params.get('popout');
export const paramsTabId = params.get('tabid');
export const paramsFrameId = params.get('frameid');
export const paramsVideoTitle = params.get('title');
export const paramsEmbedded = params.get('embedded');
export const paramsContinuation = params.get('continuation');
export const paramsIsVOD = params.get('isReplay');
export const paramsEmbedDomain = params.get('embed_domain');
export const paramsTwitchUrl = params.get('twitchUrl');
export const paramsStandalone = params.get('standalone');

/** @enum {String} */
export const YtcDeleteBehaviour = {
  HIDE: 'HIDE',
  PLACEHOLDER: 'PLACEHOLDER',
  NOTHING: 'NOTHING'
};

/** @enum {String} */
export const FeaturePrompt = {
  SPOTLIGHT: 'SPOTLIGHT'
};

export const ytcDeleteItems = [
  { value: YtcDeleteBehaviour.HIDE, text: 'Hide message' },
  { value: YtcDeleteBehaviour.PLACEHOLDER, text: 'Show placeholder' },
  { value: YtcDeleteBehaviour.NOTHING, text: 'Do nothing' }
];

export const showBlockItems = [
  { text: 'show', value: 'show' },
  { text: 'block', value: 'block' }
];

export const plainRegexItems = [
  { text: 'plain', value: 'plain' },
  { text: 'regex', value: 'regex' }
];

export const chatAuthorItems = [
  { text: 'message', value: 'chat' },
  { text: 'author', value: 'author' }
];

export const defaultCaption = `
Captions captured from the chat will appear here. Try moving and resizing!
You can also disable floating captions or make captions disappear
when inactive in the settings menu.
`;

export const modifierKeys = new Set(['Alt', 'Control', 'Meta', 'Shift']);

export const isTwitch = paramsStandalone === 'twitch' || !!(paramsTwitchUrl ?? '');
