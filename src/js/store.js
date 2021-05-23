import { Browser, BROWSER, TextDirection, VideoSide } from './constants.js';
import { LookupStore, SyncStore } from './storage.js';

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

export const
  language = SS('language', 'English'),
  showModMessage = SS('showModMessage', true),
  chatZoom = SS('chatZoom', defaultZoom),
  showTimestamp = SS('showTimestamp', true),
  textDirection = SS('textDirection', TextDirection.BOTTOM),
  videoSide = SS('videoSide', VideoSide.LEFT, false),
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
  lastVersion = SS('lastVersion', '0.0.0'),
  smoothAutoScroll = SS('smoothAutoScroll', true);
