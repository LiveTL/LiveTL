export function omniComplete(initialWords) {
  const words = initialWords || [];
  const addWord = word => words.push(word);
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
