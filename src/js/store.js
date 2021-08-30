import { Browser, BROWSER, TextDirection, VideoSide, ChatSplit, YtcDeleteBehaviour, DisplayMode, paramsEmbedded } from './constants.js';
import { getAllVoiceNames, getVoiceMap } from './utils.js';
import { LookupStore, SyncStore } from './storage.js';
// eslint-disable-next-line no-unused-vars
import { writable, readable, derived, Readable } from 'svelte/store';
import { compose } from './utils.js';

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
const defaultZoom = BROWSER == Browser.ANDROID ? 0.5 : 1;
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
  mute: 'm',
  togglePlayPause: ' '
};

// Settings
export const
  language = SS('language', 'English'),
  showModMessage = SS('showModMessage', true),
  chatZoom = SS('chatZoom', defaultZoom),
  showTimestamp = SS('showTimestamp', true),
  textDirection = SS('textDirection', TextDirection.BOTTOM),
  videoSideSetting = SS('videoSide', VideoSide.LEFT, false),
  showCaption = SS('showCaption', true),
  captionDuration = SS('captionDuration', 10),
  captionFontSize = SS('captionFontSize', 18),
  captionWidth = SS('captionWidth', 80, false),
  captionLeft = SS('captionLeft', 10, false),
  captionTop = SS('captionTop', 80, false),
  doSpeechSynth = SS('doSpeechSynth', false),
  speechVolume = SS('speechVolume', 1),
  doTranslatorMode = SS('doTranslatorMode', false),
  videoPanelSize = SS('videoPanelSize', 70, false),
  chatSize = SS('chatSize', 50, false),
  livetlFontSize = SS('livetlFontSize', 18),
  textWhitelist = SS('textFilters', [''].slice(1)),
  textBlacklist = SS('textBlacklist', [''].slice(1)),
  plaintextWhitelist = SS('plaintextWhitelist', [''].slice(1)),
  plaintextBlacklist = SS('plaintextBlacklist', [''].slice(1)),
  usernameFilters = LS('userFilters', false),
  channelFilters = LS('channelFilters', { name: '', blacklist: false, whitelist: false }),
  plainAuthorWhitelist = SS('plainAuthorWhitelist', [''].slice(1)),
  regexAuthorWhitelist = SS('regexAuthorWhitelist', [''].slice(1)),
  plainAuthorBlacklist = SS('plainAuthorBlacklist', [''].slice(1)),
  regexAuthorBlacklist = SS('regexAuthorBlacklist', [''].slice(1)),
  customFilters = SS('customFilters', [sampleFilter].slice(1)),
  enableCaptionTimeout = SS('enableCaptionTimeout', false),
  chatSplit = SS('chatSplit', ChatSplit.HORIZONTAL),
  lastVersion = SS('lastVersion', '0.0.0'),
  screenshotRenderWidth = SS('screenshotRenderWidth', 500),
  welcomeDismissed = SS('welcomeDismissed', false),
  macros = SS('macros', []),
  doAutoPrefix = SS('doAutoPrefix', false),
  enableMchadTLs = SS('enableMchadTLs', true),
  enableAPITLs = SS('enableAPITLs', true),
  enableExportButtons = SS('enableExportButtons', true),
  enableFullscreenButton = SS('enableFullscreenButton', true),
  mchadUsers = LS('mchadUsers', false),
  autoPrefixTag = SS('autoPrefixTag', '[$filterLang]'),
  macroTrigger = SS('macroTrigger', '/'),
  ytcDeleteBehaviour = SS('ytcDeleteBehaviour', YtcDeleteBehaviour.HIDE),
  autoVertical = SS('autoVertical', true),
  enableSpamProtection = SS('enableSpamProtection', true),
  spamMsgAmount = SS('spamMsgAmount', 5),
  spamMsgInterval = SS('spamMsgInterval', 10),
  spammersDetected = LS('spammersDetected', [sampleSpam].slice(1)),
  speechVoiceNameSetting = SS('speechVoiceNameSetting', ''),
  speechSpeed = SS('speechSpeed', 1),
  keyboardShortcuts = SS('keyboardShortcuts', defaultShortcuts);

// Non-persistant stores

/** @typedef {{width: Number, height: Number}} WindowDimension */
/** @type {Readable<WindowDimension>} */
const getWindowDims = () => ({ width: window.innerWidth, height: window.innerHeight });
export const windowSize = readable(getWindowDims(), set => {
  const cb = compose(set, getWindowDims);
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
});
const videoSideDepends = [videoSideSetting, autoVertical, windowSize];
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
      $voiceNames.includes($speechVoiceNameSetting) ?
        $speechVoiceNameSetting : $voiceNames[0]
    ); 
  },
);
export const speechSpeaker = derived(
  [speechVoiceName, voiceNames],
  ([$speechVoiceName, _$voiceNames]) => getVoiceMap().get($speechVoiceName),
);

export const updatePopupActive = writable(false);
export const videoTitle = writable('LiveTL');
export const timestamp = writable(0);
export const faviconURL = writable('/48x48.png');
export const availableMchadUsers = writable([]);
export const spotlightedTranslator = writable(null);
export const displayMode = writable(paramsEmbedded ? DisplayMode.EMBEDDED : DisplayMode.FULLPAGE);
export const isResizing = writable(false);
export const sessionHidden = writable([]);
