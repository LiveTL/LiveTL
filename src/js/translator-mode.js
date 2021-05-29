import { compose } from './utils.js';
import { get } from 'svelte/store';

export function omniComplete(initialWords) {
  let words = initialWords || [];
  const callbacks = [];
  let changes = 0;
  let wordSet = new Set(words);

  const addWord = word => {
    if (!wordSet.has(word)) {
      changes++;
      words.push(word)
      wordSet.add(word);
      notify();
    }
  }

  const addSentence = sentence => sentence.split(/\W+/).forEach(addWord);
  // Currently goes through everything,
  // replace with trie or sorted array if this is a bottleneck
  const complete = wordPortion => words
    .filter(word => word.startsWith(wordPortion))
    .sort();
  const getWords = () => [...words];

  const notify = () => setTimeout(() => {
    if (changes) {
      changes = 0;
      callbacks.forEach(cb => cb(words));
      return;
    }
    notify();
  });

  const subscribe = callbacks.push.bind(callbacks);

  const syncWith = store => {
    store.subscribe($words => {
      words = $words
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

export function macroSystem(initialMacros) {
  let macros = {...initialMacros} || {};
  const completion = omniComplete(Object.keys(macros));

  const addMacro = (name, expansion) => {
    macros[name] = expansion;
    completion.addWord(name);
  };
  const getMacro = name => {
    if (macros[name]) return macros[name];
    const possibleMacros = completion.complete(name);
    return possibleMacros.length == 1 ? macros[possibleMacros[0]] : null;
  };

  const splitText = text => [text, text.matchAll(/[\w\/]+/g)];
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
  const replaceText = compose(replaceSplitText, splitText);
  const completeEnd = (text, completion) => {
    return text.replace(/\/([\w]+)$/, completion);
  };
  const complete = text => {
    try {
      return completion.complete(text.match(/\/([\w]+)$/)[1]);
    }
    catch (e) { return []; }
  };

  return {
    addMacro,
    complete,
    completeEnd,
    getMacro,
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
  const focussed = () => get(focusRec);

  const replaceText = text => focussed()
    ? macrosys.completeEnd(text, macrosys.getMacro(focussed()))
    : macrosys.replaceText(text);

  const spaceIf = cond => cond ? ' ' : '';
  const setChatCaret = pos => setCaret(chatBox, chatBox.textContent.length);
  const text = () => chatBox.textContent;
  const updateRecommendations =
    compose(recommendations.set, macrosys.complete, text)
  const updateContent = compose(content.set, text);

  // TODO get the caret position and manually add in the text
  // instead of setTimeout
  // Known bug: if user types space too fast, focusRec has updated to null
  // and no completion will occur
  const onKeyDown = e => setTimeout(() => {
    e.preventDefault();
    updateRecommendations();

    if (isSpace(e) || isTab(e) && oneRecommend()) {
      const newText = replaceText(text()) + spaceIf(isTab(e));
      if (newText != text()) {
        chatBox.textContent = newText + invisible;
        setChatCaret();
      }
    }

    if (isTab(e)) setTimeout(setChatCaret);
    updateRecommendations();
    updateContent();
  });

  const cleanUps = [
    () => chatBox.removeEventListener('keydown', onKeyDown),
  ];
  if (chatBox.cleanUpTlMode) chatBox.cleanUpTlMode();
  chatBox.cleanUpTlMode = () => cleanUps.forEach(c => c());
  chatBox.addEventListener('keydown', onKeyDown);
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
