import { derived, Readable } from 'svelte/store';
import { Message, Seconds } from './types.js';

/**
 * Removes duplicate messages that come from mchad sync with ytc
 *
 * @param {Readable<Message>} source
 * @param {Seconds} sourceLatency the amount of lag between ytc and other sources
 * @return {Readable<Message>}
 */
export function removeDuplicateMessages(source, sourceLatency=10) {
  let lastMessages = [];
  return derived(source, $msg => {
    if ($msg == null) return;

    lastMessages = lastMessages
      .filter(isRecentMessage($msg, sourceLatency));

    if (lastMessages.some(isDuplicateOf($msg))) return;
    lastMessages.push($msg);
    return $msg;
  });
}

/** @type {(msg: Message) => Seconds} */
const messageTime = msg => {
  const timeSegments = msg.timestamp.split(':').map(m => parseInt(m));
  if (timeSegments.length === 3) {
    const [hours, minutes, seconds] = timeSegments;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (timeSegments.length === 2) {
    const [minutes, seconds] = timeSegments;
    return minutes * 60 + seconds;
  }
  throw new Error('Invalid timestamp format');
};

/** @type {(mostRecent: Message, latency: Number) => (msg: Message) => Boolean} */
const isRecentMessage = (mostRecent, latency) => msg =>
  messageTime(mostRecent) - messageTime(msg) <= latency;

/** @type {(msg: Message) => (otherMsg: Message) => Boolean} */
const isDuplicateOf = msg => otherMsg =>
  removeWhitespace(msg.text) === removeWhitespace(otherMsg.text) &&
    msg.types !== otherMsg.types;

/** @type {(text: String) => String} */
const removeWhitespace = text => text.trim().replace(/(\W)\W+/g, '$1');
