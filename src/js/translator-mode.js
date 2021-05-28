import { compose } from './utils.js';

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
  const complete = text => {
    try {
      return completion.complete(text.match(/\/([\w]+)$/)[1]);
    }
    catch (e) { return text; }
  };

  return {
    addMacro,
    complete,
    getMacro,
    replaceText,
  };
}
