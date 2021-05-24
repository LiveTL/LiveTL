import { omniComplete } from '../../js/translator-mode.js';

describe('omnicompletion', () =>{ 
  const wordBank = ['hello', 'there', 'general', 'though', 'that', 'hey'];

  it('adds words', () => {
    const complete = omniComplete();
    complete.addWord('hello');
    expect(complete.getWords()).toContain('hello');
  });

  it('adds sentences', () => {
    const { addSentence, getWords } = omniComplete();
    addSentence('hello there, general kenobi!');
    const { toContain } = expect(getWords());
    ['hello', 'there', 'general', 'kenobi'].forEach(toContain);
  });

  it('loads initial words', () => {
    const complete = omniComplete(wordBank);
    const words = complete.getWords();
    expect(words).toContain('hello');
    expect(words).toContain('there');
  })

  it('doesn\'t complete when there are no matching words', () => {
    const { complete } = omniComplete(wordBank);
    expect(complete('ken')).toEqual([]);
  });

  it('completes when there is one matching word', () => {
    const { complete } = omniComplete(wordBank);
    expect(complete('the')).toEqual(['there']);
  });

  it('completes in order of least to greatest', () => {
    const { complete } = omniComplete(wordBank);
    expect(complete('th')).toEqual(['that', 'there', 'though']);
  })

  it('doesn\'t add duplicates', () => {
    const { addSentence, getWords } = omniComplete(wordBank);
    addSentence('hello there, general kenobi');
    expect(getWords().length).toEqual(wordBank.length);
  })
});
