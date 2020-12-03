/**
 * Parses translation
 *
 * @param msg the message to parse
 * @return undefined or
 * {
 *    lang: lang code
 *    msg: message
 * }
 */
function parseTranslation (msg) {
  return surroundFilter(msg) || endFilter(msg)
}

function isLangMatch (textLang, currentLang) {
  textLang = textLang.toLowerCase().split(/[\/\ \-\:\.\|]/).filter(s => s !== '')
  return textLang.length <= 2 && textLang.some(s => (
    currentLang.name.toLowerCase().startsWith(s) ||
    s === currentLang.code ||
    currentLang.lang.toLowerCase().startsWith(s)
  ))
}

function createSurroundRegex () {
  const surroundTokens = [
    '()', '[]', '{}', '||', '<>'
  ]
  let pattern = ''
  let patternEnd = ''
  let notPattern = ''

  surroundTokens.forEach((token) => {
    pattern = `${pattern}\\${token[0]}`
    patternEnd = `${patternEnd}\\${token[1]}`
    notPattern = `${notPattern}^\\${token[0]}^\\${token[1]}`
  })

  return new RegExp(
    `^([${pattern}])([${notPattern}]+)([${patternEnd}]) ?[\-\:\.\|]? ?(.+)`
  )
}

function surroundTokensMatch (token1, token2) {
  switch (token1) {
    case '(':
      return token2 === ')'
    case '[':
      return token2 === ']'
    case '{':
      return token2 === '}'
  }
  return token1 === token2
}

function surroundFilter (msg) {
  const surroundRegex = createSurroundRegex()
  const result = surroundRegex.exec(msg)
  if (result && surroundTokensMatch(result[1], result[3])) {
    return {
      lang: result[2].trim(),
      msg: result[4],
    }
  }
}

function endFilter (msg) {
  const result = /^([^\-^\:^\|]+)[\-\:\.\|] ?(.+)/.exec(msg)
  if (result) {
    return {
      lang: result[1].trim(),
      msg: result[2],
    }
  }
}

module.exports = { parseTranslation, isLangMatch }

