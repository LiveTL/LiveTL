// eslint-disable-next-line no-unused-vars
import { get, derived, readable, Readable } from 'svelte/store';
// eslint-disable-next-line no-unused-vars
import { APITranslation, Message, ScriptMessage, UnixTimestamp } from './types.js';
import { AuthorType, isLive } from './constants.js';
import { formatTimestampMillis, sortBy, suppress, toJson } from './utils.js';
import { enableAPITLs, timestamp } from './store.js';

export const sseToStream = link => readable(null, set => {
  if (!isLive) return () => { };

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

/** @type {(apitl: APITranslation) => ScriptMessage} */
const transformApiTl = apitl => ({
  text: apitl.translatedText,
  messageArray: [{ type: 'text', text: apitl.translatedText }],
  author: authorName(apitl.translatorId),
  timestamp: formatTimestampMillis(apitl.start),
  unix: Math.floor(apitl.start / 1000),
  types: AuthorType.api
});

/** @type {(videoId: String) => Readable<Message>} */
export const getArchive = videoId => readable(null, async set => {
  const script = await fetch(apiArchiveLink(videoId))
    .then(toJson)
    .then(s => s.map(transformApiTl))
    .then(sortBy('unix'));

  return archiveStreamFromScript(script).subscribe(tl => {
    if (enableAPITLs.get())
      set(tl);
  });
});

/** @type {(videoId: String) => Readable<Message>} */
export const getLiveTranslations = videoId => derived(sseToStream(apiLiveLink(videoId)), $data => {
  if ($data?.videoId !== videoId || !enableAPITLs.get()) return;
  return transformApiTl($data);
});
