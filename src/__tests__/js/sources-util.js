/* eslint-disable no-undef */
import { removeDuplicateMessages, getSpamAuthors } from '../../js/sources-util.js';
import { AuthorType } from '../../js/constants.js';



let msgIds = 0;

const message = (text, author, timestampMs, types=0) => ({
  text,
  messageArray: [{ type: 'text', text }],
  author,
  authorId: author,
  timestampMs,
  id: '9',
  messageId: ++msgIds,
  types
});


describe('message duplication mitigation', () =>{ 
  it('filters duplicate messages from another source within the past 10 seconds', () => {
    const messages = [
      message('Konichiwassup', 'Taishi', 100000, AuthorType.mchad),
      message('hello there', 'Taishi', 112000,  AuthorType.mchad),
      message('hello there', 'Taishi Ch.', 115000, 0),
    ];
    const expectedMessages = [
      messages[0],
      messages[1]
    ];
    expect(removeDuplicateMessages(messages, 10)).toEqual(expectedMessages);
  });

  // test case is based off a situation that happened
  it('catches cases of duplicates where there are messages sent in between', () => {
    const messages = [
      message('Haachama: *eats spider', 'Taishi', 114000, AuthorType.mchad),
      message('Cook me and eat me Haachama pls', 'Shrek Wazowski', 115000, 0),
      message('Haachama: *enlightened noises', 'Taishi', 118000, AuthorType.mchad),
      message('Haachama: *eats spider', 'Taishi ch.', 120000, 0),
      message('Haachama: *enlightened noises', 'Taishi ch.', 125000, 0),
    ];
    const expectedMessages = [
      messages[0],
      messages[1],
      messages[2],
    ];
    expect(removeDuplicateMessages(messages, 10)).toEqual(expectedMessages);
  });

  // needed for repeated tls like '*explains meme' with other tls in between
  it('lets messages that are duplicates of a message outside of the last 10 seconds through', () => {
    const messages = [
      message('Konichiwassup', 'Taishi', 100000, AuthorType.mchad),
      message('hello there', 'Taishi Ch.', 105000,  0),
      message('Konichiwassup', 'Taishi', 112000, AuthorType.mchad),
      message('hello there', 'Taishi Ch.', 118000, 0),
      message('Konichiwassup', 'Taishi Ch.', 130000, 0),
      message('hello there', 'Taishi', 140000, AuthorType.mchad),
    ];
    expect(removeDuplicateMessages(messages, 10)).toEqual(messages);
  });

  it('lets non-duplicate messages of same source through', () => {
    const messages = [
      message('Konichiwassup', 'Taishi', 100000, 0),
      message('hello there', 'Taishi Ch.', 105000,  0),
      message('good translation', 'Taishi', 112000, 0),
      message('another good translation', 'Taishi Ch.', 118000, 0),
      message('puhehehe', 'Taishi Ch.', 130000, 0),
      message('hehe', 'Taishi', 140000, 0),
    ];
    expect(removeDuplicateMessages(messages, 10)).toEqual(messages);
  });

  it('admits duplicate messages of inside the last 10 seconds and from same source', () => {
    const messages = [
      message('*Explains meme', 'Taishi', 100000, AuthorType.mchad),
      message('*Explains meme', 'Taishi Ch.', 105000, 0),
      message('*Explains meme', 'Taishi', 108000, AuthorType.mchad),
    ];
    const expectedMessages = [
      messages[0],
      messages[2],
    ];
    expect(removeDuplicateMessages(messages, 10)).toEqual(expectedMessages);
  });

  it('lets non-duplicate messages through', () => {
    const messages = [
      message('Hey there', 'Taishi', 120000, AuthorType.mchad),
      message('Hello there', 'Taishi Ch.', 100000, 0),
      message('Konichiwassup', 'Shrek Wazowski', 200000, 0),
    ];
    expect(removeDuplicateMessages(messages, 10)).toEqual(messages);
  });
});

describe('spam author identification', () => {
  it('flags a spam author', () => {
    const messages = [
      message('Spam', 'anti', 1235000),
      message('Spam', 'anti', 1235000),
      message('Spam', 'anti', 1235000),
      message('Spam', 'anti', 1236000),
      message('Spam', 'anti', 1236000),
      message('Not spam', 'kento', 1236000),
      message('Spam', 'anti', 1236000),
      message('Spam', 'anti', 1236000),
    ];
    expect(getSpamAuthors(messages, 6, 1).flat()).toContain('anti');
  });

  it('doesn\'t flag regular frequent authors', () => {
    const messages = [
      message('Spam', 'anti', 1235000),
      message('Spam', 'anti', 1235000),
      message('Not spam', 'kento', 1235000),
      message('Spam', 'anti', 1236000),
      message('Spam', 'anti', 1236000),
      message('Not spam', 'kento', 1236000),
      message('Spam', 'anti', 1236000),
      message('Spam', 'anti', 1236000),
      message('Not spam', 'kento', 1237000),
    ];
    expect(getSpamAuthors(messages, 6, 1).flat()).not.toContain('kento');
  });

  it('doesn\'t flag regular authors when many are messaging at a time', () => {
    const messages = [
      message('College apps im dying', 'kento', 1235000),
      message('Give me ur feet hachama', 'shrek', 1235000),
      message('Hello there', 'taishi', 1235000),
    ];
    expect(getSpamAuthors(messages, 3, 1)).toEqual([]);
  });
});
