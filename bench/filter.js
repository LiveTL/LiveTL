const { parseTranslation, isLangMatch } = require('../LiveTL/js/lib/filter.js')
const { languages } = require('../LiveTL/js/lib/constants.js')

const benchAmount = 100000

let langs = {}
languages.forEach(lang => {
  langs[lang.code] = lang
})

function benchParseTranslation () {
  const testCases = [
    {
      msg: '(en) Hello there',
    },
    {
      msg: 'jp - リーーーーーーー',
    },
    {
      msg: 'No translation',
    },
    {
      msg: 'Still no translation',
    },
  ]

  const beg = Date.now()

  for (let i = 0; i < benchAmount; ++i) {
    testCases.forEach(({ msg }) => {
      let res = parseTranslation(msg)
    })
  }

  return Date.now() - beg
}

function benchLangMatch () {
  const testCases = [
    {
      testCase: ['En', langs.en],
    },
    {
      testCase: ['Eng', langs.en],
    },
    {
      testCase: ['Jap', langs.jp],
    },
    {
      testCase: ['hi', langs.en],
    },
    {
      testCase: ['en/jp', langs.en],
    },
    {
      testCase: ['en/jp', langs.jp],
    },
    {
      testCase: ['TL: eng', langs.en],
    },
    {
      testCase: [': jap', langs.jp],
    },
    {
      testCase: ['英語/EN', langs.en],
    }
  ]

  const beg = Date.now()

  for (let i = 0; i < benchAmount; ++i) {
    testCases.forEach(({ testCase }) => {
        let res = isLangMatch(...testCase)
    })
  }

  return Date.now() - beg
}

console.log(`parseTranslation in ${benchParseTranslation()} ms`);
console.log(`langMatch in ${benchLangMatch()} ms`)

