export function omniComplete(initialWords) {
  const words = initialWords || [];
  const callbacks = [];
  let changes = 0;
  const wordSet = new Set(words);

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
  // replace with trie if this is a bottleneck
  const complete = wordPortion => words
    .filter(word => word.startsWith(wordPortion))
    .sort();
  const getWords = () => [...words];

  const notifyWork = () => {
    if (changes) {
      changes = 0;
      callbacks.forEach(cb => cb(words));
      return;
    }
    setTimeout(notifyWork);
  };

  const notify = () => setTimeout(notifyWork);
  const subscribe = callbacks.push.bind(callbacks);

  return {
    addWord,
    addSentence,
    complete,
    getWords,
    subscribe
  };
}
