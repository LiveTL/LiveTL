// eslint-disable-next-line no-unused-vars
import { derived, readable, Readable } from 'svelte/store';
// eslint-disable-next-line no-unused-vars
import { Message, UnixTimestamp } from './types.js';
import { AuthorType } from './constants.js';

export const sseToStream = link => readable(null, set => {
  const source = new EventSource(link);

  source.onmessage = event => {
    set(JSON.parse(event.data));
  };

  return function stop() {
    source.close();
  };
});

/** @type {(videoId: String) => String} */
const apiLink = videoId =>
  `https://api.livetl.app/translations/stream?videoId=${videoId}?languageCode=en`;

/** @type {(videoId: String) => Readable<Message>} */
export const getLiveTranslations = videoId => derived(sseToStream(apiLink(videoId)), $data => {
  if ($data?.videoId !== videoId) return;
  return {
    text: $data.translatedText,
    messageArray: [{ type: 'text', text: $data.translatedText }],
    author: 'Taishi', // TODO actually find the author
    timestamp: '', // TODO extract and use the archive unix to timestamp logic
    types: AuthorType.api
  };
});
