/* eslint-disable no-undef */
import { parseTranslation, isLangMatch, matchesUserFilter } from '../../js/filter.js';
import { languages } from '../../js/constants.js';
import { textWhitelist } from '../../js/store.js';

const langs = {};
languages.forEach(lang => {
  langs[lang.code] = lang;
});

describe.each([
  [ '(en) Hello there', { lang: 'en', msg: 'Hello there' } ],
  [ '(es) - Hola eso', { lang: 'es', msg: 'Hola eso' } ],
  [ '【jp】 Weird bracket gang', { lang: 'jp', msg: 'Weird bracket gang' } ],
  [ 'jp - リーーーーーーー', { lang: 'jp', msg: 'リーーーーーーー' } ],
  [ 'en:Test translation', { lang: 'en', msg: 'Test translation' } ],
  [ '[en]: test translation', { lang: 'en', msg: 'test translation' } ],
  [ 'No translation', undefined ]
])('parseTranslation("%s")', (msg, expected) => {
  it(`returns ${expected}`, () => {
    expect(parseTranslation(msg)).toEqual(expected);
  });
});

describe.each([
  [ 'En', langs.en, true ],
  [ 'Eng', langs.en, true ],
  [ 'Jap', langs.jp, true ],
  [ 'hi', langs.en, false ],
  [ 'en/jp', langs.en, true ],
  [ 'en/jp', langs.jp, true ],
  [ 'TL: eng', langs.en, true ],
  [ ': jap', langs.jp, true ],
  [ '英語／EN', langs.en, true ],
  [ '英語／jp', langs.en, false ],
  [ '【Polka˽EN】', langs.en, true ]
])('isLangMatch("%s", "%s")', (textLang, currentLang, expected) => {
  it(`says the match is ${expected}`, () => {
    expect(isLangMatch(textLang, currentLang)).toEqual(expected);
  });
});

describe('user regex filter', () => {
  it('does not match every message if no filters', () => {
    textWhitelist.set([]);
    expect(matchesUserFilter('hello there')).toBeFalsy();
  });

  it('matches when there is one filter', () => {
    textWhitelist.set(['hello']);
    expect(matchesUserFilter('hello there')).toBeTruthy();
    expect(matchesUserFilter('hey there')).toBeFalsy();
  });

  it('matches when there are multiple filters', () => {
    textWhitelist.reset();
    textWhitelist.set(['hello', 'there', 'general']);
    expect(matchesUserFilter('hello kenobi')).toBeTruthy();
    expect(matchesUserFilter('there are three filters')).toBeTruthy();
    expect(matchesUserFilter('general kenobi')).toBeTruthy();
    expect(matchesUserFilter('none of the filters')).toBeFalsy();
  });
});