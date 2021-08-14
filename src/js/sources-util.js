import { Message, Seconds } from './types.js';

/**
 * Removes duplicate messages that come from mchad sync with ytc
 *
 * @param {Message[]} msgs
 * @param {Seconds} sourceLatency the amount of lag between ytc and other sources
 * @return {Message[]} 
 */
export function removeDuplicateMessages(msgs, sourceLatency=10) {
  let lastMessages = [];
  const isUnique = msg => {
    lastMessages = lastMessages
      .filter(isRecentMessage(msg, sourceLatency));

    if (lastMessages.some(isDuplicateOf(msg))) return false;
    lastMessages.push(msg);
    return true;
  };
  return msgs.filter(Boolean).filter(isUnique);
}

/** @type {(msg: Message) => Seconds} */
const messageTime = msg => msg.timestampMs / 1000;

/** @type {(mostRecent: Message, latency: Number) => (msg: Message) => Boolean} */
const isRecentMessage = (mostRecent, latency) => msg =>
  messageTime(mostRecent) - messageTime(msg) <= latency;

/** @type {(msg: Message) => (otherMsg: Message) => Boolean} */
const isDuplicateOf = msg => otherMsg =>
  messageEquals(msg, otherMsg) || messageDup(msg, otherMsg);

/** @type {(msg: Message, otherMsg: Message) => Boolean} */
const messageDup = (msg, otherMsg) =>
  removeWhitespace(msg.text) === removeWhitespace(otherMsg.text) &&
    msg.types !== otherMsg.types;

/** @type {(msg: Message, otherMsg: Message) => Boolean} */
const messageEquals = (msg, otherMsg) => msg.text === otherMsg.text &&
  msg.timestamp === otherMsg.timestamp &&
  msg.authorId === otherMsg.authorId;

/** @type {(text: String) => String} */
const removeWhitespace = text => text.trim().replace(/(\W)\W+/g, '$1');
