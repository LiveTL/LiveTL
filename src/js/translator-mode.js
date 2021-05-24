export function omniComplete(initialWords) {
  const words = initialWords || [];
  const wordSet = new Set(words);
  const addWord = word => {
    if (!wordSet.has(word)) {
      words.push(word)
      wordSet.add(word);
    }
  }
  const addSentence = sentence => sentence.split(/\W+/).forEach(addWord);
  // Currently goes through everything, replace with trie
  const complete = wordPortion => words
    .filter(word => word.startsWith(wordPortion))
    .sort();
  const getWords = () => [...words];

  return {
    addWord,
    addSentence,
    complete,
    getWords
  };
}
