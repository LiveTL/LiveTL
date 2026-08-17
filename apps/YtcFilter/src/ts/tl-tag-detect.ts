export const languagesInfo = [
  { code: 'en', name: 'English', lang: 'English', tag: 'en-US', selectionName: '' },
  { code: 'jp', name: 'Japanese', lang: '日本語', tag: 'jp-JP', selectionName: '' },
  { code: 'es', name: 'Spanish', lang: 'Español', tag: 'es-MX', selectionName: '' },
  { code: 'id', name: 'Indonesian', lang: 'Bahasa Indonesia', tag: 'id-ID', selectionName: '' },
  { code: 'kr', name: 'Korean', lang: '한국어', tag: 'ko-KR', selectionName: '' },
  { code: 'ch', name: 'Chinese', lang: '中文', tag: 'zh-CN', selectionName: '' },
  { code: 'ru', name: 'Russian', lang: 'русский', tag: 'ru-RO', selectionName: '' },
  { code: 'fr', name: 'French', lang: 'Français', tag: 'fr-FR', selectionName: '' },
  { code: 'de', name: 'German', lang: 'Deutsch', tag: 'de-DE', selectionName: '' }
];

const languageConversionTable: {
  [key: string]: (typeof languagesInfo)[number];
} = {};
export const languageNameCode: {
  [key: string]: (typeof languagesInfo)[number];
} = {};

const createLangSelectionName = (lang: (typeof languagesInfo)[number]): string => {
  return `${lang.lang} (${lang.tag})`;
};
export const languageNameValues = languagesInfo.map(lang => ({
  text: createLangSelectionName(lang), value: lang.lang
}));

languagesInfo.forEach(i => (languageConversionTable[createLangSelectionName(i)] = i));
languagesInfo.forEach(lang => (languageNameCode[lang.code] = lang));
languagesInfo.forEach(lang => (lang.selectionName = createLangSelectionName(lang)));
export const languageCodeArray = Object.keys(languageNameCode);

const MAX_LANG_TAG_LEN = 7;
const langTokens = [['[', ']'], ['{', '}'], ['(', ')'], ['|', '|'], ['<', '>'], ['【', '】'], ['「', '」'], ['『', '』'], ['〚', '〛'], ['（', '）'], ['〈', '〉'], ['⁽', '₎']];
const startLangTokens = langTokens.flatMap(e => e[0]);
const tokenMap = Object.fromEntries(langTokens);
const transDelimiters = ['-', ':'];
const langSplitRe = /\W+/;

export function parseTranslation(message: string): { lang: string, msg: string } | undefined {
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

export function isLangMatch(textLang: string, currentLangTag: string): boolean {
  const currentLang = languageNameCode[currentLangTag];
  const lower = textLang.toLowerCase();
  const textLangs = lower.split(langSplitRe);
  return [...textLangs, lower].some(s => (
    s.length >= 2 && (
      currentLang.name.toLowerCase().startsWith(s) ||
      s === currentLang.code ||
      currentLang.lang.toLowerCase().startsWith(s)
    )
  ));
}
