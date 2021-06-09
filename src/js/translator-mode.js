import { compose, dbg } from './utils.js';
import { get, writable, Writable } from 'svelte/store';
import { doTranslatorMode, doAutoPrefix, language, macros } from './store.js';
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
  const splitText = text => [text, text.matchAll(/[\w\/]+/g)];
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

  return {
    addMacro,
    complete,
    completeEnd,
    getMacro,
    syncWith,
    replaceText,
  };
}

export function translatorMode(
  [container, chatBox],
  content,
  recommendations,
  focusRec,
) {
  const macrosys = macroSystem({ en: '[en]', peko: 'pekora', ero: 'erofi' });
  const invisible = '‍';
  const invisiReg = new RegExp(invisible, 'g');
  const oneRecommend = () => get(recommendations).length === 1;
  const isKey = key => e => e.key === key;
  const isTab = isKey('Tab');
  const isSpace = isKey(' ');
  const isEnter = isKey('Enter');
  const isCharData = m => m.type === 'characterData';
  const focussed = () => get(focusRec);

  macrosys.syncWith(macros);

  const replaceText = text => focussed()
    ? macrosys.completeEnd(text, macrosys.getMacro(focussed()))
    : macrosys.replaceText(text);

  const removeLastSpace = text => text.endsWith(' ')
    ? text.substring(0, text.length - 1)
    : text;

  const setChatboxText = text => {
    const carPos = caretPos();
    const atEnd = caretAtEnd();
    if (text) container.setAttribute('has-text', '');
    chatBox.textContent = text + invisible;
    setChatCaret(atEnd ? null : carPos);
    updateStores();
  };

  const updateStores = () => {
    updateRecommendations();
    updateContent();
  };

  const spaceIf = cond => cond ? ' ' : '';
  const setChatCaret =
    pos => setCaret(chatBox, pos == null ? text().length : pos);
  const caretPos = () => getCaretCharOffset(chatBox);
  const caretAtEnd = () => caretPos() == text().length;
  const text = () => chatBox.textContent;
  // TODO
  // eslint-disable-next-line no-constant-condition
  const autoPrefixTag = () => doAutoPrefix.get() ? langTag() + invisible : '';
  const textWithoutLastSpace = compose(removeLastSpace, text);
  const updateRecommendations =
    compose(recommendations.set, macrosys.complete, text);
  const updateContent = compose(content.set, text);
  const setAutoPrefix = compose(setChatboxText, autoPrefixTag);
  const doubleTimeout = cb => setTimeout(() => setTimeout(cb));

  // Keydown event
  let e = null;

  const onKeyDown = $e => {
    if (!get(doTranslatorMode)) return;
    e = $e;
    if (isTab(e) && oneRecommend()) substituteInChatbox();
    if (isTab(e)) doubleTimeout(setChatCaret);
    if (isEnter(e)) doubleTimeout(setAutoPrefix);
  };

  const substituteInChatbox = () => {
    const newText = replaceText(textWithoutLastSpace()) + ' ';
    if (newText != text()) {
      setTimeout(() => setChatboxText(newText));
    }
  };

  const onMutation = () => {
    if (!get(doTranslatorMode)) return;
    if (isSpace(e)) {
      substituteInChatbox();
    }
    updateStores();
  };

  const onFocus = () => {
    if (!get(doTranslatorMode)) return;
    setTimeout(setAutoPrefix);
  }

  const processMutations = mutations => mutations
    .filter(isCharData)
    .forEach(onMutation);

  const chatBoxObserver = new MutationObserver(processMutations);

  const cleanUps = [
    () => chatBox.removeEventListener('keydown', onKeyDown),
    () => chatBox.removeEventListener('focus', onFocus),
    () => chatBoxObserver.disconnect(),
  ];
  if (chatBox.cleanUpTlMode) chatBox.cleanUpTlMode();
  chatBox.cleanUpTlMode = () => cleanUps.forEach(c => c());
  chatBox.addEventListener('keydown', onKeyDown);
  chatBox.addEventListener('focus', onFocus);
  chatBoxObserver.observe(container, { subtree: true, characterData: true });
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

const langTag = () => `[${languageNameCode[language.get()].code}] `;
