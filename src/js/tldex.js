import { MCHAD, Holodex, AuthorType, languageNameCode } from './constants.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Ty from './types.js';
import { derived, readable } from 'svelte/store';
import { enableTldexTLs, mchadUsers, languages } from './store.js';
import { formatTimestampMillis, sleep, sortBy, toJson } from './utils.js';
import { archiveStreamFromScript, sseToStream } from './api.js';

/** @typedef {import('svelte/store').Readable} Readable */
/** @typedef {(unix: Ty.UnixTimestamp) => String} UnixToTimestamp */
/** @typedef {(unix: Ty.UnixTimestamp) => number} UnixToNumber */

/** @type {(arr: Array) => Boolean} */
const isNotEmpty = arr => arr.length !== 0;

/** @type {(videoLink: String, retryInterval: Ty.Seconds) => Promise<Ty.MCHADLiveRoom[] | undefined>} */
const getVideoDataWithRetry = async (videoLink, retryInterval) => {
  for (;;) {
    const dt = await fetch(`${Holodex}/videos/${videoLink}`).then(toJson);
    if (dt.status !== 'past') return undefined;
    if (dt.start_actual || dt.available_at) return (dt.start_actual ? Date.parse(dt.available_at) : Date.parse(dt.start_actual));
    await sleep(retryInterval * 1000);
  }
};

/** @type {(videoLink: String) => Readable<Ty.Message>} */
export const getArchive = videoLink => readable(null, async set => {
  const startTime = await getVideoDataWithRetry(videoLink, 3);
  if (!startTime) return () => { };

  await languages.loaded;
  const scripts = await Promise.all(languages.get().map((language) => languageNameCode[language]).map(e => e.code).map(async (langcode) => {
    return fetch(`${Holodex}/videos/${videoLink}/chats?lang=${langcode}&verified=0&moderator=0&vtuber=0&tl=1&limit=100000`).then(toJson)
      .then(e => e.filter(c => !c.is_owner && !c.channel_id)
        .map(c => {
          return ({
            author: c.name,
            authorId: c.name,
            text: c.message,
            messageArray: [{ type: 'text', text: c.message }],
            langCode: langcode,
            messageId: ++mchadTLCounter,
            timestamp: formatTimestampMillis(c.timestamp - startTime),
            types: AuthorType.tldex,
            timestampMs: c.timestamp - startTime,
            unix: Math.floor((c.timestamp - startTime) / 1000)
          });
        }))
      .then(s => s.filter(e => e.unix >= 0))
      .then(sortBy('unix'))
      .catch(() => []);
  })).then(scripts => scripts.filter(isNotEmpty));

  if (scripts.length === 0) return () => { };

  scripts.forEach(script => {
    [...new Set(script.map(e => e.author))].forEach(author => {
      mchadUsers.set(author, mchadUsers.get(author));
    });
  });

  const unsubscribes = scripts
    .map(archiveStreamFromScript)
    .map(stream => stream.subscribe(tl => {
      if (tl && enableTldexTLs.get() && !mchadUsers.get(tl.author)) { set(tl); }
    }));

  return () => unsubscribes.forEach(u => u());
});

/** @type {(room: String) => Readable<Ty.MCHADStreamItem>} */
const streamRoom = (videoLink, langcode) => sseToStream(`${MCHAD}/holoproxy?id=YT_${videoLink}&lang=${langcode}`);

/** @type {(time: String) => String} */
const removeSeconds = time => time.replace(/:\d\d /, ' ');

/** @type {UnixToTimestamp} */
const liveUnixToTimestamp = unix =>
  removeSeconds(new Date(unix).toLocaleString('en-us').split(', ')[1]);

let mchadTLCounter = 0;

/** @type {(room: Ty.MCHADLiveRoom) => Readable<Ty.Message>} */
export const getRoomTranslations = (videoLink, langCode) => derived(streamRoom(videoLink, langCode), (data, set) => {
  if (!enableTldexTLs.get()) return;
  const flag = data?.flag;

  if ((flag === 'insert' || flag === 'update') && !data?.content?.channel_id) {
    set({
      text: data.content.msg,
      messageArray: [{ type: 'text', text: data.content.msg }],
      author: data.content.name,
      authorId: data.content.name,
      langCode,
      messageId: ++mchadTLCounter,
      timestamp: liveUnixToTimestamp(data.content.time),
      types: AuthorType.tldex,
      timestampMs: data.content.time
    });
  }
});

/** @type {(link: String) => Readable<Ty.Message>} */
export const getLiveTranslations = videoLink => readable(null, async set => {
  await languages.loaded;
  const unsubscribes = languages.get().map((language) => languageNameCode[language]).map(e => e.code).map(langcode => getRoomTranslations(videoLink, langcode).subscribe(msg => {
    if (msg && enableTldexTLs.get() && !mchadUsers.get(msg.author)) {
      set(msg);
    }
  }));

  return () => unsubscribes.forEach(u => u());
});
