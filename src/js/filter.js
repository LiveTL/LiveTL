import {
  textWhitelist,
  textBlacklist,
  plaintextWhitelist,
  plaintextBlacklist,
  plainAuthorWhitelist,
  plainAuthorBlacklist,
  regexAuthorWhitelist,
  regexAuthorBlacklist
} from './store.js';
// eslint-disable-next-line no-unused-vars
import { SyncStore } from './storage.js';

const MAX_LANG_TAG_LEN = 7;

const langTokens = [['[', ']'], ['{', '}'], ['(', ')'], ['|', '|'], ['<', '>'], ['【', '】'], ['「', '」'], ['『', '』'], ['〚', '〛'], ['（', '）'], ['〈', '〉'], ['⁽', '₎']];
const startLangTokens = langTokens.flatMap(e => e[0]);
const tokenMap = Object.fromEntries(langTokens);

const transDelimiters = ['-', ':'];
const langSplitRe = /[^A-Za-z]/;

/**
 * @param {SyncStore} ufilters
 * @param {(filter: String) => String} transform
 * @return {(message: String) => Boolean}
 */
function userFilter(ufilters, transform = filter => filter) {
  /** @type {RegExp | null} */
  let userRegex = null;
  ufilters.subscribe(filters => {
    userRegex = filters.length
      ? new RegExp(filters.map(transform).join('|'))
      : null;
  });

  return message => userRegex
    ? userRegex.test(message)
    : false;
}

const composeOr = (...args) => ipt => args.some(a => a(ipt));

export const textWhitelisted = userFilter(textWhitelist);
export const textBlacklisted = userFilter(textBlacklist);
export const plaintextWhitelisted = userFilter(plaintextWhitelist, escapeRegExp);
export const plaintextBlacklisted = userFilter(plaintextBlacklist, escapeRegExp);
export const regAuthorWhitelisted = userFilter(regexAuthorWhitelist);
export const regAuthorBlacklisted = userFilter(regexAuthorBlacklist);
export const plainAuthorWhitelisted = userFilter(plainAuthorWhitelist, escapeRegExp);
export const plainAuthorBlacklisted = userFilter(plainAuthorBlacklist, escapeRegExp);

/** @type {(message: String) => Boolean} */
export const isWhitelisted = composeOr(
  textWhitelisted, plaintextWhitelisted
);
/** @type {(message: String) => Boolean} */
export const isBlacklisted = composeOr(
  textBlacklisted, plaintextBlacklisted
);

/** @type {(author: String) => Boolean} */
export const authorWhitelisted = composeOr(
  regAuthorWhitelisted, plainAuthorWhitelisted
);
/** @type {(author: String) => Boolean} */
export const authorBlacklisted = composeOr(
  regAuthorBlacklisted, plainAuthorBlacklisted
);


/**
 * @param {String} message 
 * @returns {{lang: String, msg: String} | undefined}
 */
export function parseTranslation(message) {
  const trimmed = message.trim();

  // try bracket trans blocks first - '[lang]', '[lang] -'
  const leftToken = trimmed[0];
  const rightToken = tokenMap[leftToken];

  const righTokenIndex = trimmed.indexOf(rightToken);

  if (righTokenIndex !== -1) {
    const startsWithLeftToken = startLangTokens.includes(trimmed[0]);

    if (startsWithLeftToken) {
      const lang = trimmed.slice(1, righTokenIndex);
      let msg = trimmed.slice(righTokenIndex + 1).trim();

      // remove potential trailing dash
      if (msg[0] === '-' || msg[0] === ':') {
        msg = msg.slice(1).trim();
      }

      return {
        lang,
        msg
      };
    }
  }

  // try all delims
  for (const delim of transDelimiters) {
    const idx = trimmed.indexOf(delim);

    if (idx !== -1 && idx < MAX_LANG_TAG_LEN) {
      const lang = trimmed.slice(0, idx).trim().replace(/\W/g, '');
      const msg = trimmed.slice(idx + 1).trim();

      return {
        lang,
        msg
      };
    }
  }

  return undefined;
}

/**
 * @param {String} str
 * @returns {String}
 */
export function removeEmojis(str) {
  return str;
  // no need to remove emoji, issue was invalid chars
  // return str.replace(/([#0-9]\u20E3)|[\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?/g, '');
}

/**
 * @param {String} textLang 
 * @param {{ code: String, name: String, lang: String }} currentLang 
 * @returns {Boolean}
 */
export function isLangMatch(textLang, currentLang) {
  const textLangs = textLang.toLowerCase().split(langSplitRe).filter(s => s !== '');
  return textLangs.some(s => (
    s && s.length >= 2 && (
      currentLang.name.toLowerCase().startsWith(s) ||
      s === currentLang.code ||
      currentLang.lang.toLowerCase().startsWith(s)
    )
  ));
}


// https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
