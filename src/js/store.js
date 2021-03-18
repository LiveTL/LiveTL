import { Browser, BROWSER } from './web-constants';
import { TextDirection, VideoSide } from './constants.js';
import { SettingStore } from './storage.js';

const SS = (n, d) => new SettingStore(n, d);
const defaultZoom = BROWSER == Browser.ANDROID ? 0.5 : 1;

export const
  language = SS('language', 'en'),
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
  doTranslatorMode = SS('doTranslatorMode', false);