// eslint-disable-next-line no-unused-vars
import { get, derived, readable, Readable } from 'svelte/store';
// eslint-disable-next-line no-unused-vars
import { Message, ScriptMessage, UnixTimestamp } from './types.js';
import { AuthorType } from './constants.js';
import { formatTimestampMillis, suppress, toJson } from './utils.js';
import { timestamp } from './store.js';

export const sseToStream = link => readable(null, set => {
  const source = new EventSource(link);

  source.onmessage = event => {
    suppress(() => set(JSON.parse(event.data)));
  };

  return function stop() {
    source.close();
  };
});

/** @type {(script: ScriptMessage[]) => Readable<Message>} */
export const archiveStreamFromScript = script => readable(null, set => {
  const inFuture = tl => tl.unix > prev;

  let prev = get(timestamp);
  let futureTL = script.find(inFuture);

  return timestamp.subscribe($time => {
    if (prev <= futureTL?.unix && futureTL?.unix <= $time) {
      set(futureTL);
    }
    prev = $time;
    futureTL = script.find(inFuture);
  });
});

/** @type {(endpoint: String) => String} */
const url = endpoint => `https://api.livetl.app${endpoint}`;

/** @type {(id: String) => String)} */
const authorName = (() => {
  const lookup = new Map();
  const addTranslator = translator => lookup.set(translator.userID, translator.displayName);
  const addTranslators = translators => translators.forEach(addTranslator);
  fetch(url('/translators/registered')).then(toJson).then(addTranslators);
  return lookup.get.bind(lookup);
})();

/** @type {(videoId: String) => String} */
const apiLiveLink = videoId => url(`/translations/stream?videoId=${videoId}?languageCode=en`);

/** @type {(videoId: String) => String} */
const apiArchiveLink = videoId => url(`/translations/${videoId}/en`);

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
