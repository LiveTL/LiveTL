import { Browser, BROWSER, TextDirection, VideoSide } from './constants.js';
import { LookupStore, SyncStore } from './storage.js';

/**
 * @template T
 * @param {String} n 
 * @param {T} d 
 * @returns {SyncStore<T>}
 */
const SS = (n, d) => new SyncStore(n, d);
/**
 * @template T
 * @param {String} n 
 * @param {T} d 
 * @returns {LookupStore<T>}
 */
const LS = (n, d) => new LookupStore(n, d);
const defaultZoom = BROWSER == Browser.ANDROID ? 0.5 : 1;

export const
  language = SS('language', 'English'),
  showModMessage = SS('showModMessage', true),
  chatZoom = SS('chatZoom', defaultZoom),
  showTimestamp = SS('showTimestamp', true),
  textDirection = SS('textDirection', TextDirection.BOTTOM),
  videoSide = SS('videoSide', VideoSide.LEFT),
  showCaption = SS('showCaption', true),
  captionDuration = SS('captionDuration', -1),
  captionFontSize = SS('captionFontSize', 18),
  captionWidth = SS('captionWidth', 80),
  captionLeft = SS('captionLeft', 10),
  captionTop = SS('captionTop', 10),
  doSpeechSynth = SS('doSpeechSynth', false),
  speechVolume = SS('speechVolume', 1),
  doTranslatorMode = SS('doTranslatorMode', false),
  videoPanelSize = SS('videoPanelSize', 80),
  chatSize = SS('chatSize', 50),
  livetlFontSize = SS('livetlFontSize', 18),
  textWhitelist = SS('textFilters', [''].slice(1)),
  textBlacklist = SS('textBlacklist', [''].slice(1)),
  plaintextWhitelist = SS('plaintextWhitelist', [''].slice(1)),
  plaintextBlacklist = SS('plaintextBlacklist', [''].slice(1)),
  usernameFilters = LS('userFilters', false),
  channelFilters = LS('channelFilters', { name: '', blacklist: false, whitelist: false }),
  lastVersion = SS('lastVersion', '0.0.0');
