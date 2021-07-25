import { writable } from 'svelte/store';

import { removeDuplicateMessages } from '../../js/sources-util.js';
import { AuthorType } from '../../js/constants.js';


const createTestObjects = () => {
  const source = writable(null);
  const withoutDups = removeDuplicateMessages(source);
  const aggregate = [];
  withoutDups.subscribe($m => {
    if ($m) aggregate.push($m);
  });
  return { source, withoutDups, aggregate: () => aggregate };
};

const message = (text, author, types) => ({
  text,
  messageArray: [{ type: 'text', text }],
  author,
  timestamp: '00:00:00',
  id: '9',
  types
});


describe('message duplication mitigation', () =>{ 
  it('doesn\'t let messages that are the same as the last message through', () => {
    const { aggregate, source } = createTestObjects();
    const messages = [
      message('Konichiwassup', 'Taishi', AuthorType.mchad),
      message('hello there', 'Taishi', AuthorType.mchad),
      message('hello there', 'Taishi Ch.', 0),
    ];
    const expectedMessages = [
      messages[0],
      messages[1]
    ];
    messages.forEach(source.set);
    expect(aggregate()).toEqual(expectedMessages);
  });

  // needed for repeated tls like '*explains meme' with other tls in between
  it('lets messages that are duplicates of a message not the last message through', () => {
    const { aggregate, source } = createTestObjects();
    const messages = [
      message('Konichiwassup', 'Taishi', AuthorType.mchad),
      message('hello there', 'Taishi Ch.', 0),
      message('Konichiwassup', 'Taishi', AuthorType.mchad),
      message('hello there', 'Taishi Ch.', 0),
      message('Konichiwassup', 'Taishi Ch.', 0),
      message('hello there', 'Taishi', AuthorType.mchad),
    ];
    messages.forEach(source.set);
    expect(aggregate()).toEqual(messages);
  });

  it('lets non-duplicate messages through', () => {
    const { aggregate, source} = createTestObjects();
    const messages = [
      message('Hey there', 'Taishi', AuthorType.mchad),
      message('Hello there', 'Taishi Ch.', 0),
      message('Konichiwassup', 'Shrek Wazowski', 0),
    ];
    messages.forEach(source.set);
    expect(aggregate()).toEqual(messages);
  });
});
