/* eslint-disable no-undef */
import { omniComplete, macroSystem } from '../../js/translator-mode.js';
import { get, writable } from 'svelte/store';

const sleep = time => new Promise(res => setTimeout(res, time));

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
  });

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
  });

  it('doesn\'t add duplicates', () => {
    const { addSentence, getWords } = omniComplete(wordBank);
    addSentence('hello there, general kenobi');
    expect(getWords().length).toEqual(wordBank.length);
  });

  it('updates subscribers', async () => {
    const { addWord, addSentence, subscribe } = omniComplete();
    let fired = 0;
    const cb = () => fired++;
    subscribe(cb);
    addWord('hello');
    await sleep(0);
    expect(fired).toBe(1);
    addSentence('hello there general kenobi');
    await sleep(0);
    expect(fired).toBe(2);
  });

  it('synchronizes with stores', async () => {
    const { addWord, getWords, syncWith } = omniComplete();
    const store = writable(['hello']);
    syncWith(store);
    expect(getWords()).toContain('hello');
    addWord('there');
    await sleep(0);
    const { toContain } = expect(get(store));
    ['hello', 'there'].forEach(toContain);
  });
});

describe('macro system', () => {
  const macros = {
    peko: 'pekora',
    kiara: 'kiara',
    en: '[en]',
    coco: 'coco',
    naki: 'ayame',
    kan: 'kanata',
  };

  describe('default behaviour', () => {
    it('adds macros', () => {
      const { addMacro, getMacro } = macroSystem();
      addMacro('bot', 'botan');
      expect(getMacro('bot')).toBe('botan');
    });

    it('replaces text with full macros', () => {
      const { replaceText } = macroSystem(macros);
      expect(replaceText('/en /peko: hello there, /naki: dochi dochi'))
        .toBe('[en] pekora: hello there, ayame: dochi dochi');
    });

    it('replaces text with partial macros', () => {
      const { replaceText } = macroSystem(macros);
      expect(replaceText('/e /pe: hello there, /n: dochi dochi'))
        .toBe('[en] pekora: hello there, ayame: dochi dochi');
    });

    it('doesn\'t replace escaped macros', () => {
      const { replaceText } = macroSystem(macros);
      const text = '//e //pe: hello there, //n: dochi dochi';
      expect(replaceText(text)).toBe(text);
    });

    it('generates completions', () => {
      const { complete } = macroSystem(macros);
      expect(complete('[en] /k')).toEqual(['kan', 'kiara']);
    });
  });

  describe('syncing leader character with store', () => {
    const setupMacrosys = () => {
      const sys = macroSystem(macros);
      const leaderStore = writable('/');
      sys.syncLeaderWith(leaderStore);
      return {
        ...sys,
        leaderStore
      };
    };

    it('can generate completions with the synced leader', () => {
      const { complete, leaderStore } = setupMacrosys();
      expect(complete('[en] /k')).toEqual(['kan', 'kiara']);

      leaderStore.set(',');

      expect(complete('[en] /k')).toEqual([]);
      expect(complete('[en] ,k')).toEqual(['kan', 'kiara']);
    });

    it('can replace text with full macros with the synced leader', () => {
      const { leaderStore, replaceText } = setupMacrosys();
      expect(replaceText('/en /peko: hello there, /naki: dochi dochi'))
        .toBe('[en] pekora: hello there, ayame: dochi dochi');

      leaderStore.set(',');

      expect(replaceText(',en ,peko: hello there, ,naki: dochi dochi'))
        .toBe('[en] pekora: hello there, ayame: dochi dochi');
    });

    it('replaces text with partial macros with the synced leader', () => {
      const { leaderStore, replaceText } = setupMacrosys();
      expect(replaceText('/e /pe: hello there, /n: dochi dochi'))
        .toBe('[en] pekora: hello there, ayame: dochi dochi');

      leaderStore.set(',');

      expect(replaceText(',e ,pe: hello there, ,n: dochi dochi'))
        .toBe('[en] pekora: hello there, ayame: dochi dochi');

    });

    it('doesn\'t replace escaped macros with the synced leader', () => {
      const { leaderStore, replaceText } = setupMacrosys();
      const text = '//e //pe: hello there, //n: dochi dochi';
      expect(replaceText(text)).toBe(text);

      leaderStore.set(',');

      const commaLeaderText = text.replace(/\//g, ',');
      expect(replaceText(commaLeaderText)).toBe(commaLeaderText);
    });
  });
});
