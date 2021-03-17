import { SettingStore } from './storage.js';

const SS = (n, d) => new SettingStore(n, d);

export const
  language = SS('language', 'en'),
  displayModMessage = SS('displayModMessage', true),
  chatZoom = SS('chatZoom', /* TODO default */),
  showTimestamp = SS('showTimestamp', /* TODO default */),
  textDirection = SS('textDirection', /* TODO default */),
  chatSide = SS('chatSide', 'RIGHT'),
  showCaption = SS('showCaption', true),
  captionDuration = SS('captionDuration', -1),
  captionZoom = SS('captionZoom', /* TODO default */),
  doSpeechSynth = SS('doSpeechSynth', false),
  speechVolume = SS('speechVolume', /* TODO default */),
  doTranslatorMode = SS('doTranslatorMode', false);