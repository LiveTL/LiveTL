const MAX_LANG_TAG_LEN = 7;

const langTokens = [['[', ']'], ['{', '}'], ['(', ')'], ['|', '|'], ['<', '>'], ['【', '】'], ['「', '」'], ['『', '』'], ['〚', '〛'], ['（', '）'], ['〈', '〉'], ['⁽', '₎']];
const startLangTokens = langTokens.flatMap(e => e[0]);
const tokenMap = Object.fromEntries(langTokens);

const transDelimiters = ['-', ':'];
const langSplitRe = /[^A-Za-z]/;
// const langSplitRe = /[^A-Za-z\/\ \-\:\.\|\／]/;
/**
 * Parses translation
 *
 * @param message the message to parse
 * @return undefined or
 * {
 *    lang: lang code
 *    msg: message
 * }
 */
const parseTranslation = message => {
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
};

function isLangMatch(textLang, currentLang) {
  textLang = textLang.toLowerCase().split(langSplitRe).filter(s => s !== '');
  return textLang.length <= 2 && textLang.some(s => (
    currentLang.name.toLowerCase().startsWith(s) ||
    s === currentLang.code ||
    currentLang.lang.toLowerCase().startsWith(s)
  ));
}

module.exports = { parseTranslation, isLangMatch };
