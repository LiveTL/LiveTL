/**
 * Constants that do not depend on browser apis
 */

// JS enums
export const
  VideoSide = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    // TOP: 'TOP'
  },
  TextDirection = {
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
  };

export const languages = [
  { code: 'en', name: 'English', lang: 'English' },
  { code: 'jp', name: 'Japanese', lang: '日本語' },
  { code: 'es', name: 'Spanish', lang: 'Español' },
  { code: 'id', name: 'Indonesian', lang: 'bahasa Indonesia' },
  { code: 'kr', name: 'Korean', lang: '한국' },
  { code: 'ch', name: 'Chinese', lang: '中文' },
  { code: 'ru', name: 'Russian', lang: 'русский' },
  { code: 'fr', name: 'French', lang: 'Français' }
];

export const languageConversionTable = {};
export const languageNameValues = languages.map(lang => ({
  name: createLangSelectionName(lang), value: lang.lang
}));

function createLangSelectionName(lang) {
  return `${lang.name} (${lang.lang})`;
}

languages.forEach(i => languageConversionTable[createLangSelectionName(i)] = i);