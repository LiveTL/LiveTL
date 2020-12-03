const langTokens = [["[", "]"], ["{", "}"], ["(", ")"], ["|", "|"], ["<", ">"]];
const startLangTokens = langTokens.flatMap(e => e[0]);
const tokenMap = Object.fromEntries(langTokens);

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

  const startsWithLeftToken = startLangTokens.includes(trimmed[0]);
  if (!startsWithLeftToken) {
    return undefined;
  }

  const leftToken = trimmed[0];
  const rightToken = tokenMap[leftToken];

  const righTokenIndex = trimmed.indexOf(rightToken);
  if (righTokenIndex === -1) {
    return undefined;
  }

  // 1 - opening token
  const lang = trimmed.slice(1, righTokenIndex);
  // 1 - closing token, trim - may be space after [lang] block
  const msg = trimmed.slice(righTokenIndex + 1).trim();

  return {
    lang,
    msg,
  };
};

function isLangMatch (textLang, currentLang) {
  textLang = textLang.toLowerCase().split(/[\/\ \-\:\.\|]/).filter(s => s !== '')
  return textLang.length <= 2 && textLang.some(s => (
    currentLang.name.toLowerCase().startsWith(s) ||
    s === currentLang.code ||
    currentLang.lang.toLowerCase().startsWith(s)
  ))
}

module.exports = { parseTranslation, isLangMatch };
