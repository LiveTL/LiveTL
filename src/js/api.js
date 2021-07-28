// eslint-disable-next-line no-unused-vars
import { derived, get, readable, Readable } from 'svelte/store';
// eslint-disable-next-line no-unused-vars
import { APITranslation, Message, ScriptMessage } from './types.js';
import { AuthorType, paramsIsVOD } from './constants.js';
import { formatTimestampMillis, sortBy } from './utils.js';
import { enableAPITLs, timestamp } from './store.js';
import ReconnectingEventSource from 'reconnecting-eventsource';
import { getTranslationNotificationsEndpointUrl, getTranslators, loadTranslations } from '@livetl/api-wrapper/src/api';

export const sseToStream = link => readable(null, set => {
  if (paramsIsVOD) return () => { };

  const source = new ReconnectingEventSource(link);

  source.onmessage = event => {
    // regex to handle informational messages from the LTL API, *should* work for MChad, as according to their docs all messages are immediately parsable to JSON
    const match = event.data.match(/^(\w{1,}): (.*)/); // we can use match groups to split the string for us
    if (match !== null) {
      switch (match[1].toUpperCase()) {
      case 'CONNECTED':
        console.info(`API SSE: ${match[2]}`);
        return;
      case 'WARN':
        console.warn(`API SSE Warning: ${match[2]}`);
        return;
      case 'ERROR':
        console.error(`API SSE Error: ${match[2]}`);
        source.close();
        return;
      }
    }

    const jsonData = JSON.parse(event.data);
    set(jsonData);
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

/** @type {(id: String) => String)} */
const authorName = (() => {
  const lookup = new Map();
  const addTranslator = translator => lookup.set(translator.userID, translator.displayName);
  const addTranslators = translators => translators.forEach(addTranslator);
  getTranslators().then(addTranslators);
  return lookup.get.bind(lookup);
})();

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
  // TODO server side filtering of translators in the blacklist
  const apiResponse = await loadTranslations(videoId, 'en'); // TODO FIXME don't hardcode to en
  if (typeof apiResponse !== 'object') {
    console.debug(`Got error message "${apiResponse}" when loading translations from API`);
    return;
  }

  const script = sortBy('unix')(apiResponse.map(transformApiTl));
  return archiveStreamFromScript(script).subscribe(tl => {
    if (enableAPITLs.get())
      set(tl);
  });
});

/** @type {(videoId: String) => Readable<Message>} */
export const getLiveTranslations = videoId => derived(sseToStream(getTranslationNotificationsEndpointUrl(videoId, 'en')), $data => { // TODO FIXME don't hardcode to en
  if ($data?.videoId !== videoId || !enableAPITLs.get()) return;
  if ($data?.start / 1000 < window.player.getDuration() - 10) return; // if the timestamp of the translation is more than 10 seconds of the timestamp of the player, ignore it
  return transformApiTl($data);
});
