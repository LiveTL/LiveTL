// eslint-disable-next-line no-unused-vars
import { derived, readable, Readable } from 'svelte/store';
// eslint-disable-next-line no-unused-vars
import { Message, UnixTimestamp } from './types.js';
import { AuthorType } from './constants.js';
import { formatTimestampMillis, toJson } from './utils.js';

export const sseToStream = link => readable(null, set => {
  const source = new EventSource(link);

  source.onmessage = event => {
    set(JSON.parse(event.data));
  };

  return function stop() {
    source.close();
  };
});

/** @type {(endpoint: String) => String} */
const url = endpoint => `https://api.livetl.app${endpoint}`;

const authorName = (() => {
  const lookup = new Map();
  const addTranslator = translator => lookup.set(translator.userID, translator.displayName);
  const addTranslators = translators => translators.forEach(addTranslator);
  fetch(url('/translators/registered')).then(toJson).then(addTranslators);
  return lookup.get.bind(lookup);
})();

window.authorName = authorName;

/** @type {(videoId: String) => String} */
const apiLiveLink = videoId => url(`/translations/stream?videoId=${videoId}?languageCode=en`);

/** @type {(videoId: String) => Readable<Message>} */
export const getLiveTranslations = videoId => derived(sseToStream(apiLiveLink(videoId)), $data => {
  if ($data?.videoId !== videoId) return;
  return {
    text: $data.translatedText,
    messageArray: [{ type: 'text', text: $data.translatedText }],
    author: authorName($data.translatorId),
    timestamp: formatTimestampMillis($data.start),
    types: AuthorType.api
  };
});
