import { MCHAD, Holodex, AuthorType, languageNameCode, isTwitch } from './constants.js';
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

const getTypes = (c) => {
  if (!c.channel_id) return AuthorType.tldex;

  let types = 0;
  if (c.is_owner) types |= AuthorType.owner;
  if (c.is_moderator) types |= AuthorType.moderator;
  if (c.is_verified) types |= AuthorType.verified;
  return types;
};

/** @type {(url: string, meta: Ty.ScriptMeta) => Promise<Ty.Message[]>} */
const getScript = async (url, meta) => await fetch(url)
  .then(toJson)
  .then(e => e.filter(c => !c.is_owner)
    .map(c => {
      return ({
        author: c.name,
        authorId: c.channel_id ?? c.name,
        text: c.message,
        messageArray: [{ type: 'text', text: c.message }],
        langCode: meta.langCode,
        messageId: ++mchadTLCounter,
        timestamp: formatTimestampMillis(c.timestamp - meta.startTime),
        types: getTypes(c),
        timestampMs: c.timestamp - meta.startTime,
        unix: Math.floor((c.timestamp - meta.startTime) / 1000)
      });
    }))
  .then(s => s.filter(e => e.unix >= 0))
  .then(sortBy('unix'))
  .catch(() => []);

/** @type {(videoLink: String) => Readable<Ty.Message>} */
export const getArchive = videoLink => readable(null, async set => {
  let startTime = isTwitch
    ? 0
    : await getVideoDataWithRetry(videoLink, 3);
  // if (!startTime) return () => { };

  await languages.loaded;
  const langCodes = languages
    .get()
    .map((language) => languageNameCode[language])
    .map(l => l.code);

  console.log('AM HERE');
  const scripts = await Promise.all(langCodes.map(async langCode => {
    const meta = { langCode, startTime };
    const twitchScript = await getScript(
      `${Holodex}/videos/custom/chats?tl=1&lang=${langCode}&custom_video_id=${videoLink}`,
      meta
    );
    if (twitchScript.length !== 0) return twitchScript;
    return await getScript(
      `${Holodex}/videos/${videoLink}/chats?lang=${langCode}&verified=0&moderator=0&vtuber=0&tl=1&limit=100000`,
      meta
    );
  })).then(scripts => scripts.filter(isNotEmpty)).catch(() => []);

  console.log('got scripts', scripts);

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

/** @type {UnixToTimestamp} */
const liveUnixToTimestamp = unix =>
  new Date(unix).toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' });

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
