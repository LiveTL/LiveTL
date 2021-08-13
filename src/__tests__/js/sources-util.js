import { writable } from 'svelte/store';

import { removeDuplicateMessages } from '../../js/sources-util.js';
import { AuthorType } from '../../js/constants.js';


const message = (text, author, timestamp, types) => ({
  text,
  messageArray: [{ type: 'text', text }],
  author,
  timestamp,
  id: '9',
  types
});


describe('message duplication mitigation', () =>{ 
  it('filters duplicate messages from another source within the past 10 seconds', () => {
    const messages = [
      message('Konichiwassup', 'Taishi', '00:10:00', AuthorType.mchad),
      message('hello there', 'Taishi', '00:10:12',  AuthorType.mchad),
      message('hello there', 'Taishi Ch.', '10:15', 0),
    ];
    const expectedMessages = [
      messages[0],
      messages[1]
    ];
    expect(removeDuplicateMessages(messages)).toEqual(expectedMessages);
  });

  // test case is based off a situation that happened
  it('catches cases of duplicates where there are messages sent in between', () => {
    const messages = [
      message('Haachama: *eats spider', 'Taishi', '00:10:14', AuthorType.mchad),
      message('Cook me and eat me Haachama pls', 'Shrek Wazowski', '10:15', 0),
      message('Haachama: *enlightened noises', 'Taishi', '00:10:18', AuthorType.mchad),
      message('Haachama: *eats spider', 'Taishi ch.', '00:10:20', 0),
      message('Haachama: *enlightened noises', 'Taishi ch.', '10:25', 0),
    ];
    const expectedMessages = [
      messages[0],
      messages[1],
      messages[2],
    ];
    expect(removeDuplicateMessages(messages)).toEqual(expectedMessages);
  });

  // needed for repeated tls like '*explains meme' with other tls in between
  it('lets messages that are duplicates of a message outside of the last 10 seconds through', () => {
    const messages = [
      message('Konichiwassup', 'Taishi', '00:10:00', AuthorType.mchad),
      message('hello there', 'Taishi Ch.', '10:05',  0),
      message('Konichiwassup', 'Taishi', '00:10:12', AuthorType.mchad),
      message('hello there', 'Taishi Ch.', '10:18', 0),
      message('Konichiwassup', 'Taishi Ch.', '10:30', 0),
      message('hello there', 'Taishi', '00:10:40', AuthorType.mchad),
    ];
    expect(removeDuplicateMessages(messages)).toEqual(messages);
  });

  it('lets non-duplicate messages of same source through', () => {
    const messages = [
      message('Konichiwassup', 'Taishi', '00:10:00', 0),
      message('hello there', 'Taishi Ch.', '10:05',  0),
      message('good translation', 'Taishi', '00:10:12', 0),
      message('another good translation', 'Taishi Ch.', '10:18', 0),
      message('puhehehe', 'Taishi Ch.', '10:30', 0),
      message('hehe', 'Taishi', '00:10:40', 0),
    ];
    expect(removeDuplicateMessages(messages)).toEqual(messages);
  });

  it('admits duplicate messages of inside the last 10 seconds and from same source', () => {
    const messages = [
      message('*Explains meme', 'Taishi', '00:10:00', AuthorType.mchad),
      message('*Explains meme', 'Taishi Ch.', '10:05', 0),
      message('*Explains meme', 'Taishi', '00:10:08', AuthorType.mchad),
    ];
    const expectedMessages = [
      messages[0],
      messages[2],
    ];
    expect(removeDuplicateMessages(messages)).toEqual(expectedMessages);
  });

  it('lets non-duplicate messages through', () => {
    const messages = [
      message('Hey there', 'Taishi', '00:19:20', AuthorType.mchad),
      message('Hello there', 'Taishi Ch.', '00:19:22', 0),
      message('Konichiwassup', 'Shrek Wazowski', '00:20:00', 0),
    ];
    expect(removeDuplicateMessages(messages)).toEqual(messages);
  });
});
