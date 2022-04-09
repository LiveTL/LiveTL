import {
  Browser,
  BROWSER,
  TextDirection,
  VideoSide,
  ChatSplit,
  YtcDeleteBehaviour,
  DisplayMode,
  languageNameCode,
  paramsEmbedded,
  AutoLaunchMode
} from './constants.js';
import { getAllVoiceNames, getVoiceMap, compose } from './utils.js';
import { LookupStore, SyncStore } from './storage.js';
import { writable, readable, derived } from 'svelte/store';

/** @typedef {import('svelte/store').Readable} Readable */

/**
 * @template T
 * @param {String} n
 * @param {T} d
 * @param {Boolean} s synchronize across sessions
 * @returns {SyncStore<T>}
 */
const SS = (n, d, s = true) => new SyncStore(n, d, null, s);
/**
 * @template T
 * @param {String} n
 * @param {T} d
 * @param {Boolean} s synchronize across sessions
 * @returns {LookupStore<T>}
 */
const LS = (n, d, s = true) => new LookupStore(n, d, null, s);
const defaultZoom = BROWSER === Browser.ANDROID ? 0.5 : 1;
const sampleFilter = {
  chatAuthor: 'chat',
  plainReg: 'plain',
  showBlock: 'show',
  rule: '',
  id: ''
};

const sampleSpam = { author: '', authorId: '', spam: false };

export const defaultShortcuts = {
  volumeUp: 'ArrowUp',
  volumeDown: 'ArrowDown',
  fullScreen: 'f',
  toggleMute: 'm',
  togglePlayPause: '<Space>'
};

// Settings
export const languages = SS('languages', /** @type {Array<string>} */ ([]));
export const showModMessage = SS('showModMessage', true);
export const chatZoom = SS('chatZoom', defaultZoom);
export const showTimestamp = SS('showTimestamp', true);
export const textDirection = SS('textDirection', TextDirection.BOTTOM);
export const videoSideSetting = SS('videoSide', VideoSide.LEFT, false);
export const showCaption = SS('showCaption', true);
export const captionDuration = SS('captionDuration', 10);
export const captionFontSize = SS('captionFontSize', 18);
export const captionWidth = SS('captionWidth', 80, false);
export const captionLeft = SS('captionLeft', 10, false);
export const captionTop = SS('captionTop', 80, false);
export const doSpeechSynth = SS('doSpeechSynth', false);
export const speechVolume = SS('speechVolume', 1);
export const doTranslatorMode = SS('doTranslatorMode', false);
export const videoPanelSize = SS('videoPanelSize', 70, false);
export const chatSize = SS('chatSize', 50, false);
export const livetlFontSize = SS('livetlFontSize', 18);
export const textWhitelist = SS('textFilters', [''].slice(1));
export const textBlacklist = SS('textBlacklist', [''].slice(1));
export const plaintextWhitelist = SS('plaintextWhitelist', [''].slice(1));
export const plaintextBlacklist = SS('plaintextBlacklist', [''].slice(1));
export const usernameFilters = LS('userFilters', false);
export const channelFilters = LS('channelFilters', { name: '', blacklist: false, whitelist: false });
export const plainAuthorWhitelist = SS('plainAuthorWhitelist', [''].slice(1));
export const regexAuthorWhitelist = SS('regexAuthorWhitelist', [''].slice(1));
export const plainAuthorBlacklist = SS('plainAuthorBlacklist', [''].slice(1));
export const regexAuthorBlacklist = SS('regexAuthorBlacklist', [''].slice(1));
export const customFilters = SS('customFilters', [sampleFilter].slice(1));
export const enableCaptionTimeout = SS('enableCaptionTimeout', false);
export const chatSplit = SS('chatSplit', ChatSplit.HORIZONTAL);
export const lastVersion = SS('lastVersion', '0.0.0');
export const screenshotRenderWidth = SS('screenshotRenderWidth', 500);
export const welcomeDismissed = SS('welcomeDismissed', false);
export const macros = SS('macros', []);
export const doAutoPrefix = SS('doAutoPrefix', false);
export const enableMchadTLs = SS('enableMchadTLs', true);
export const enableAPITLs = SS('enableAPITLs', true);
export const enableExportButtons = SS('enableExportButtons', true);
export const enableFullscreenButton = SS('enableFullscreenButton', true);
export const mchadUsers = LS('mchadUsers', false);
export const autoPrefixTag = SS('autoPrefixTag', '[en]');
export const macroTrigger = SS('macroTrigger', '/');
export const ytcDeleteBehaviour = SS('ytcDeleteBehaviour', YtcDeleteBehaviour.HIDE);
export const autoVertical = SS('autoVertical', true);
export const enableSpamProtection = SS('enableSpamProtection', true);
export const spamMsgAmount = SS('spamMsgAmount', 5);
export const spamMsgInterval = SS('spamMsgInterval', 10);
export const spammersDetected = LS('spammersDetected', [sampleSpam].slice(1));
export const speechVoiceNameSetting = SS('speechVoiceNameSetting', '');
export const speechSpeed = SS('speechSpeed', 1);
export const autoLaunchMode = SS('autoLaunchMode', AutoLaunchMode.NONE);
export const keyboardShortcuts = SS('keyboardShortcuts', defaultShortcuts);
export const disableSpecialSpamProtection = SS('disableSpecialSpamProtection', true);
export const activePreset = SS('activePreset', 1);
export const presets = SS('presets', /** @type {Array<Object & { name: string }>} */ ([]));
export const showHelpPrompt = SS('showHelpPrompt', true);
export const neverShowSpotlightPrompt = SS('neverShowSpotlightPrompt', false);
export const showVerifiedMessage = SS('showVerifiedMessage', false);
export const isChatInverted = SS('isChatInverted', false);
export const twitchEnabled = SS('twitchEnabled', true);

// All the variables persisted in presets
export const presetStores = [
  captionDuration,
  captionFontSize,
  captionWidth,
  captionLeft,
  captionTop,
  videoSideSetting,
  chatZoom,
  livetlFontSize,
  textDirection,
  chatSplit,
  videoPanelSize,
  chatSize,
  keyboardShortcuts,
  doTranslatorMode,
  doAutoPrefix,
  autoPrefixTag,
  macroTrigger,
  macros,
  isChatInverted
];

// -=- Language Migration -=-
(async () => {
  const language = SS('language', 'English');
  const hasDoneLanguageMigration = SS('hasDoneLanguageMigration', false);

  await language.loaded;
  await languages.loaded;
  await hasDoneLanguageMigration.loaded;

  if (!hasDoneLanguageMigration.get()) {
    languages.set([language.get()]);
    hasDoneLanguageMigration.set(true);
  }
})();

// Non-persistant stores

/** @typedef {{width: Number, height: Number}} WindowDimension */
const getWindowDims = () => ({ width: window.innerWidth, height: window.innerHeight });
/** @type {Readable<WindowDimension>} */
export const windowSize = readable(getWindowDims(), set => {
  const cb = compose(set, getWindowDims);
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
});
const videoSideDepends = [videoSideSetting, autoVertical, windowSize];
// @ts-ignore
export const videoSide = derived(videoSideDepends, ([$videoSide, $autoVert, $windims]) => {
  const { width, height } = $windims;
  return $autoVert && height > width ? VideoSide.TOP : $videoSide;
}, videoSideSetting.get());
export const voiceNames = readable(getAllVoiceNames(), set => {
  const cb = () => {
    set(getAllVoiceNames());
    unsub();
  };
  const unsub = () => window.removeEventListener('load', cb);
  window.addEventListener('load', cb);
  return unsub;
});
export const speechVoiceName = derived(
  [speechVoiceNameSetting, voiceNames],
  ([$speechVoiceNameSetting, $voiceNames]) => {
    return (
      $voiceNames.includes($speechVoiceNameSetting)
        ? $speechVoiceNameSetting
        : $voiceNames[0]
    );
  }
);
export const speechSpeaker = derived(
  [speechVoiceName, voiceNames],
  ([$speechVoiceName, _$voiceNames]) => getVoiceMap().get($speechVoiceName)
);
export const langCode = derived(languages, $langs => $langs.map((lang) => languageNameCode[lang].code));

export const updatePopupActive = writable(false);
export const videoTitle = writable('LiveTL');
export const timestamp = writable(0);
export const faviconURL = writable('/img/48x48.png');
export const availableMchadUsers = writable([]);
export const spotlightedTranslator = writable(null);
export const displayMode = writable(
  paramsEmbedded != null ? DisplayMode.EMBEDDED : DisplayMode.FULLPAGE
);
export const isResizing = writable(false);
export const isSelecting = writable(false);
export const sessionHidden = writable([]);
export const anyRecordingShortcut = writable(false);
export const videoShortcutAction = writable('');
export const currentlyEditingPreset = writable(-1);
export const promptToShow = writable(/** @type {String[]} */ ([]));
export const scrollTo = writable(/** @type {ScrollToOptions} */ ({ top: 0 }));
