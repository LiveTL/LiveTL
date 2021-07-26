// eslint-disable-next-line no-unused-vars
import { compose, dbg, escapeRegExp } from './utils.js';
// eslint-disable-next-line no-unused-vars
import { derived, get, writable, Readable, Writable } from 'svelte/store';
// eslint-disable-next-line no-unused-vars
import { doTranslatorMode, doAutoPrefix, language, macros, autoPrefixTag, macroTrigger } from './store.js';
// TODO ACTUALLY USE macroTrigger
import { languageNameCode } from './constants.js';

export function omniComplete(initialWords) {
  let words = initialWords || [];
  const callbacks = [];
  let changes = 0;
  let wordSet = new Set(words);

  /** @type {(word: String) => void} */
  const addWord = word => {
    if (!wordSet.has(word)) {
      changes++;
      words.push(word);
      wordSet.add(word);
      notify();
    }
  };

  /** @type {(sentence: String) => void} */
  const addSentence = sentence => sentence.split(/\W+/).forEach(addWord);
  // Currently goes through everything,
  // replace with trie or sorted array if this is a bottleneck
  /** @type {(wordPortion: String) => Array<String>} */
  const complete = wordPortion => words
    .filter(word => word.startsWith(wordPortion))
    .sort();
  /** @type {() => Array<String>} */
  const getWords = () => [...words];

  /** @type {() => void} */
  const notify = () => setTimeout(() => {
    if (changes) {
      changes = 0;
      callbacks.forEach(cb => cb(words));
      return;
    }
    notify();
  });

  /** @type {(callback: (words: Array<String>) => void) => void} */
  const subscribe = callbacks.push.bind(callbacks);

  /** @type {(store: Writable<String>) => void} */
  const syncWith = store => {
    store.subscribe($words => {
      words = $words;
      wordSet = new Set(words);
    });
    subscribe(store.set.bind(store));
  };

  return {
    addWord,
    addSentence,
    complete,
    getWords,
    subscribe,
    syncWith
  };
}

function macroStoreValueToLookup(value) {
  const obj = {};
  value.filter(v => v.enabled).forEach(v => obj[v.name] = v.expansion);
  return obj;
}

export function macroSystem(initialMacros) {
  let macros = {...initialMacros} || {};
  let completion = omniComplete(Object.keys(macros));
  const getSplitTextPattern = leader => new RegExp(`[\w${leader}]+`, 'g');
  let splitTextPattern = getSplitTextPattern('/');

  /** @type {(name: String, expansion: String) => void} */
  const addMacro = (name, expansion) => {
    macros[name] = expansion;
    completion.addWord(name);
  };
  
  /** @type {(name: String) => String | null} */
  const getMacro = name => {
    if (macros[name]) return macros[name];
    const possibleMacros = completion.complete(name);
    return possibleMacros.length == 1 ? macros[possibleMacros[0]] : null;
  };

  /** @type {(text: String) => [String, Array<String>]} */
  const splitText = text => [text, text.matchAll(splitTextPattern)];
  /** @type {([input: String, split: Array<String>]) => String} */
  const replaceSplitText = ([input, split]) => {
    const replaced = [];
    let lastIdx = 0;
    for (const { '0': text, index } of split) {
      const replacement = getMacro(text.substring(1));
      replaced.push(input.substring(lastIdx, index));
      replaced.push(replacement ? replacement : text);
      lastIdx = index + text.length;
    }
    replaced.push(input.substring(lastIdx));
    return replaced.join('');
  };
  /** @type {(text: String) => String} */
  const replaceText = compose(replaceSplitText, splitText);
  /** @type {(text: String, completion: String) => String} */
  const completeEnd = (text, completion) => {
    return text.replace(/\/([\w]+)$/, completion);
  };
  /** @type {(text: String) => Array<String>} */
  const complete = text => {
    try {
      return completion.complete(text.match(/\/([\w]+)$/)[1]);
    }
    catch (e) { return []; }
  };

  // one-way syncing
  const syncWith = store => {
    store.subscribe(value => {
      macros = macroStoreValueToLookup(value);
      completion = omniComplete(Object.keys(macros));
    });
  };

  /** @type {(store: Readable<String>) => void} */
  const syncLeaderWith = store => {
    derived(store, escapeRegExp).subscribe($leader => {
      splitTextPattern = getSplitTextPattern($leader);
    });
  };

  return {
    addMacro,
    complete,
    completeEnd,
    getMacro,
    syncLeaderWith,
    syncWith,
    replaceText,
  };
}

/**
 * Does the non-rendering part of translator mode.
 *
 * Features:
 *   - auto-prefix
 *   - macros
 *
 * @param {HTMLElement} container the container for the input element (first #input)
 * @param {HTMLElement} chatBox the actual input element (second #input)
 * @param {Writable<String>} content a store to view the content of the chatbox, do not modify
 * @param {Writable<String[]>} recommendations a store to view the recommendations, do not modify
 * @param {Writable<String | null>} focusRec a store to set the focused recommendation
 */
export function translatorMode(
  [container, chatBox],
  content,
  recommendations,
  focusRec,
) {
  // initial macros will be cleared during sync
  const macrosys = macroSystem({ en: '[en]', peko: 'pekora', ero: 'erofi' });
  // use nbsp as it won't break when adding space to the end
  const nbsp = ' ';
  const oneRecommend = () => get(recommendations).length === 1;
  const isKey = key => e => e.key === key;
  const isTab = isKey('Tab');
  const isEnter = isKey('Enter');
  const focusedRecommendation = () => get(focusRec);

  macrosys.syncWith(macros);

  const replaceText = text => focusedRecommendation()
    ? macrosys.completeEnd(text, macrosys.getMacro(focusedRecommendation()))
    : macrosys.replaceText(text);

  const setChatboxText = text => {
    const carPos = caretPos();
    const atEnd = caretAtEnd();
    if (text) container.setAttribute('has-text', '');
    chatBox.textContent = text;
    setChatCaret(atEnd ? null : carPos);
    updateStores();
  };

  const updateStores = () => {
    updateRecommendations();
    updateContent();
  };

  const setChatCaret = pos =>
    setCaret(chatBox, pos == null ? text().length : pos);
  const caretPos = () => getCaretCharOffset(chatBox);
  const caretAtEnd = () => caretPos() == text().length;
  const text = () => chatBox.textContent;
  const autoPrefixTag = () => doAutoPrefix.get() ? langTag() + nbsp : '';
  const updateRecommendations =
    compose(recommendations.set, macrosys.complete, text);
  const updateContent = compose(content.set, text);
  const setAutoPrefix = compose(setChatboxText, autoPrefixTag);
  const doubleTimeout = cb => setTimeout(() => setTimeout(cb));

  const onKeyDown = e => {
    if (!get(doTranslatorMode)) return;
    if (isTab(e) && oneRecommend()) expandMacrosInChatbox();
    if (isTab(e)) doubleTimeout(setChatCaret);
    if (isEnter(e)) doubleTimeout(setAutoPrefix);
  };

  const expandMacrosInChatbox = () => {
    const newText = replaceText(text().trimEnd()) + nbsp;
    if (newText.trim() != text().trim()) {
      setChatboxText(newText);
    }
  };

  const onFocus = () => {
    if (!get(doTranslatorMode) || text() !== '') return;
    setTimeout(setAutoPrefix);
  };

  const onInput = e => {
    if (!get(doTranslatorMode)) return;
    if (e.data === ' ') {
      expandMacrosInChatbox();
    }
    updateStores();
  };

  const cleanUps = [
    () => chatBox.removeEventListener('keydown', onKeyDown),
    () => chatBox.removeEventListener('focus', onFocus),
    () => chatBox.removeEventListener('input', onInput),
  ];
  if (chatBox.cleanUpTlMode) chatBox.cleanUpTlMode();
  chatBox.cleanUpTlMode = () => cleanUps.forEach(c => c());
  chatBox.addEventListener('keydown', onKeyDown);
  chatBox.addEventListener('focus', onFocus);
  chatBox.addEventListener('input', onInput);
}

function setCaret(el, pos) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(el.childNodes[0], pos);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  el.focus();
}


// https://stackoverflow.com/a/30400227
function getCaretCharOffset(element) {
  var caretOffset = 0;

  if (window.getSelection) {
    var range = window.getSelection().getRangeAt(0);
    var preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  } 

  else if (document.selection && document.selection.type != 'Control') {
    var textRange = document.selection.createRange();
    var preCaretTextRange = document.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint('EndToEnd', textRange);
    caretOffset = preCaretTextRange.text.length;
  }

  return caretOffset;
}

const langTag = () => autoPrefixTag.get().replace(/\$filterLang/gi, languageNameCode[language.get()].code);
