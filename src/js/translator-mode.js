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
  const macros = {...initialMacros} || {};
  const completion = omniComplete(Object.keys(macros));
  const { complete } = completion;

  const addMacro = (name, expansion) => { };
  const getMacro = name => macros[name];
  const replaceText = text => text;

  return {
    addMacro,
    complete,
    getMacro,
    replaceText,
  };
}
