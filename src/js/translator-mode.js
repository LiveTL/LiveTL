export function omniComplete(initialWords) {
  let words = initialWords || [];
  const addWord = word => words.push(word);
  const addSentence = sentence => { };
  const complete = wordPortion => [];
  const getWords = () => [...words];

  return {
    addWord,
    addSentence,
    complete,
    getWords
  };
}
