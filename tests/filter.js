const assert = require('assert').strict;
const { parseTranslation, isLangMatch } = require('../LiveTL/js/lib/filter.js');
const { languages } = require('../LiveTL/js/lib/constants.js');

const langs = {};
languages.forEach(lang => {
  langs[lang.code] = lang;
});

const tests = {
  value: 0
};

function compareTranslationMatches(other, correct) {
  if (other && correct) {
    return other.lang === correct.lang && other.msg === correct.msg;
  }
  return other === correct;
}

function testParseTranslation() {
  const testCases = [
    {
      msg: '(en) Hello there',
      correct: { lang: 'en', msg: 'Hello there' }
    },
    {
      msg: '(es) - Hola eso',
      correct: { lang: 'es', msg: 'Hola eso' }
    },
    {
      msg: '【jp】 Weird bracket gang',
      correct: { lang: 'jp', msg: 'Weird bracket gang' }
    },
    {
      msg: 'jp - リーーーーーーー',
      correct: { lang: 'jp', msg: 'リーーーーーーー' }
    },
    {
      msg: 'en:Test translation',
      correct: { lang: 'en', msg: 'Test translation' }
    },
    {
      msg: '[en]: test translation',
      correct: { lang: 'en', msg: 'test translation' }
    },
    {
      msg: 'No translation',
      correct: undefined
    }
  ];

  testCases.forEach(({ msg, correct }) => {
    assert.ok(
      compareTranslationMatches(parseTranslation(msg), correct),
      `Couldn't parse translation of ${msg} to ${correct}`
    );
  });
  process.stdout.write('.');
  tests.value++;
}

function testLangMatch() {
  const testCases = [
    {
      testCase: ['En', langs.en],
      match: true
    },
    {
      testCase: ['Eng', langs.en],
      match: true
    },
    {
      testCase: ['Jap', langs.jp],
      match: true
    },
    {
      testCase: ['hi', langs.en],
      match: false
    },
    {
      testCase: ['en/jp', langs.en],
      match: true
    },
    {
      testCase: ['en/jp', langs.jp],
      match: true
    },
    {
      testCase: ['TL: eng', langs.en],
      match: true
    },
    {
      testCase: [': jap', langs.jp],
      match: true
    },
    {
      testCase: ['英語／EN', langs.en],
      match: true
    },
    {
      testCase: ['英語／jp', langs.en],
      match: false
    }

  ];
  testCases.forEach(({ testCase, match }) => {
    assert.equal(
      isLangMatch(...testCase), match,
      `Incorrect language match between ${testCase[0]} and ${testCase[1].code}`
    );
  });
  process.stdout.write('.');
  tests.value++;
}

testParseTranslation();
testLangMatch();

console.debug(`Finished ${tests.value} unit tests for filter.js`);
