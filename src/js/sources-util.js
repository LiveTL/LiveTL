/**
 * @typedef {import('./types.js').Message} Message
 * @typedef {import('./types.js').Seconds} Seconds
 */

/**
 * Removes duplicate messages that come from mchad sync with ytc
 *
 * @param {Message[]} msgs
 * @param {Seconds} sourceLatency the amount of lag between ytc and other sources
 * @return {Message[]}
 */
export function removeDuplicateMessages(msgs, sourceLatency = 60) {
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

/**
 * Find authors that send messages at a specified frequency.
 *
 * @param {Message[]} msgs
 * @param {Number} amountOfMsgs amount of msgs in the spam frequency
 * @param {Seconds} time the time between the first spam message and the latest
 * @return {String[][]} array of [authorId, authorName]
 */
export function getSpamAuthors(msgs, amountOfMsgs, time) {
  const authors = [];

  index(msgs).by('authorId').forEach((messages, author) => {
    if (containsSpam(messages, amountOfMsgs, time)) {
      authors.push([author, messages[0].author]);
    }
  });

  return authors;
}

/** @type {(msgs: Message[], amount: Number, time: Seconds) => Boolean} */
const containsSpam = (msgs, amount, time) => {
  let beg = 0;
  const timestamps = msgs.map(messageTime);
  for (const [i, timestamp] of timestamps.entries()) {
    // advance beg pointer until it is time seconds behind timestamp
    while (timestamp - timestamps[beg] > time) beg++;
    if (i - beg + 1 >= amount) return true;
  }
  return false;
};

/** @type {(msgs: Message[]) => { by: (attr: String) => Map<String, Message[]> }} */
export const index = msgs => ({
  by(attr) {
    const msgsByAttr = new Map();

    for (const msg of msgs) {
      if (!msgsByAttr.has(msg[attr])) {
        msgsByAttr.set(msg[attr], []);
      }
      msgsByAttr.get(msg[attr]).push(msg);
    }

    return msgsByAttr;
  }
});

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
const messageEquals = (msg, otherMsg) => msg.messageId === otherMsg.messageId || (
  msg.text === otherMsg.text &&
  msg.timestampMs === otherMsg.timestampMs &&
  msg.authorId === otherMsg.authorId);

/** @type {(text: String) => String} */
const removeWhitespace = text => text.trim().replace(/(\W)\W+/g, '$1');
