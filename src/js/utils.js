// eslint-disable-next-line no-unused-vars
import { UnixTransformer } from './types.js';
import { isAndroid, modifierKeys, PostMessage } from './constants.js';

export const compose = (...args) =>
  ipt => args.reduceRight((val, func) => func(val), ipt);

export const not = f => (...args) => !f(...args);

export const composeOr = (...args) => ipt => args.some(a => a(ipt));

export const dbg = (...args) => console.log(...args.map(o => `'${o}'`));

export const getWAR = path => window.chrome.runtime.getURL(path);

export const delayed = (fn, start) => {
  let val = start;
  return (...args) => {
    const prev = val;
    val = fn(...args);
    return prev;
  };
};

export const combineArr = arrs => arrs.reduce((l, r) => [...l, ...r], []);

/** @type {UnixTransformer} */
export const formatTimestampMillis = millis => {
  const time = Math.floor(millis / 1000);
  const hours = Math.floor(time / 3600);
  const mins = Math.floor(time % 3600 / 60);
  const secs = time % 60;
  return [hours, mins, secs].map(e => `${e}`.padStart(2, 0)).join(':');
};

export const toJson = r => r.json();

export const suppress = cb => {
  try {
    cb();
  }
  catch (e) {
    return undefined;
  }
};

export const sortBy = attr => arr => arr.sort((l, r) => l[attr] - r[attr]);

/** @type {(ms: Number) => Promise} */
export const sleep = ms => new Promise((res, _rej) => {
  setTimeout(res, ms);
});

// https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
/** @type {(text: String) => String} */
export const escapeRegExp = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

/** @type {(num: Number, min: Number, max: Number) => Number} */
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const getAllVoices = () => window.speechSynthesis?.getVoices() || [];
export const getAllVoiceNames = () => getAllVoices().map(voice => voice.name);
export const getVoiceMap = () => new Map(getAllVoices().map(v => [v.name, v]));

export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const transformOpt = str =>
  capitalize(str
    .trim()
    .toLowerCase());

const toKeyName = key => {
  if (!key) return '';
  if (key == 'Enter') return '<Enter>';
  if (key == ' ') return '<Space>';
  return key;
};

export const keydownToShortcut = e => [
  e?.shiftKey ? 'shift': '',
  e?.ctrlKey ? 'ctrl': '',
  e?.altKey ? 'alt': '',
  !modifierKeys.has(e?.key) ? toKeyName(e?.key) : ''
].filter(Boolean).join(' + ');

export const toggleFullScreen = () => {
  if (isAndroid) {
    // @ts-ignore
    window.nativeJavascriptInterface.toggleFullscreen();
    return;
  }
  if (
    (document.fullScreenElement && document.fullScreenElement !== null) ||
    (!document.mozFullScreen && !document.webkitIsFullScreen)
  ) {
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(
        Element.ALLOW_KEYBOARD_INPUT
      );
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
};

export const expandEmbed = () => window.parent.postMessage({
  type: PostMessage.EXPAND_EMBED
}, '*');
