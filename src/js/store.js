import { Browser, BROWSER, } from './web-constants.js';
import { TextDirection, VideoSide } from './constants.js';
import { SyncStore } from './storage.js';

/**
 * @template T
 * @param {String} n 
 * @param {T} d 
 * @returns {SyncStore<T>}
 */
const SS = (n, d) => new SyncStore(n, d);
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
  captionZoom = SS('captionZoom', defaultZoom),
  doSpeechSynth = SS('doSpeechSynth', false),
  speechVolume = SS('speechVolume', 1),
  doTranslatorMode = SS('doTranslatorMode', false),
  videoPanelSize = SS('videoPanelSize', 80),
  chatSize = SS('chatSize', 50),
  livetlFontSize = SS('livetlFontSize', 12),
  usernameFilters = SS('userFilters', {}),
  channelFilters = SS('channelFilters', {});
