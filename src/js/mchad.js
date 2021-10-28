import { MCHAD, AuthorType, languages } from './constants.js';
// eslint-disable-next-line no-unused-vars
import { Message, MCHADTL, MCHADStreamItem, MCHADLiveRoom, MCHADArchiveRoom, Seconds, UnixTimestamp } from './types.js';
// eslint-disable-next-line no-unused-vars
import { derived, get, readable, Readable } from 'svelte/store';
import { enableMchadTLs, mchadUsers } from './store.js';
import { combineArr, formatTimestampMillis, sleep, sortBy } from './utils.js';
import { archiveStreamFromScript, sseToStream } from './api.js';
import { isLangMatch } from './filter.js';

/** @typedef {(unix: UnixTimestamp) => String} UnixToTimestamp */
/** @typedef {(unix: UnixTimestamp) => number} UnixToNumber */


/** @type {(videoId: String) => (links: String[]) => Promise<MCHADLiveRoom[] | MCHADArchiveRoom[]>} */
const getRoomCreator = videoId => {
  const addVideoId = room => ({...room, videoId});
  const getRoom = link =>
    fetch(link).then(r => r.json()).then(r => r.map(addVideoId)).catch(() => []);

  return links => Promise.all(links.map(getRoom)).then(combineArr);
};

/**
 * @param {String} videoId 
 * @returns {{ live: MCHADLiveRoom[], vod: MCHADArchiveRoom[] }}
 */
export async function getRooms(videoId) {
  const getRooms_ = getRoomCreator(videoId);

  const liveLinks = [
    `${MCHAD}/Room?link=YT_${videoId}`
  ];

  const vodLinks = [
    `${MCHAD}/Archive?link=YT_${videoId}`
  ];

  const [ live, vod ] = await Promise.all([liveLinks, vodLinks].map(getRooms_));

  return { live, vod };
}

/** @type {(tag: String) => String[]} */
const possibleLanguages = tag => languages
  .map(lang => isLangMatch(tag, lang) ? [lang] : []).flat();

/** @type {(tag: String) => String | null} */
export const getRoomTagLanguageCode = tag => {
  const possible = tag
    .split(/\s+/g)
    .map(possibleLanguages)
    .flat();
  return possible[possible.length - 1]?.code ?? null;
};

/** @type {(script: MCHADTL[]) => Number} */
const getFirstTime = script =>
  script.find(s => /--.*Stream.*Start.*--/i.test(s.Stext))?.Stime
    ?? script[0]?.Stime
    ?? 0;

/**
 * @param {MCHADArchiveRoom} room
 * @returns {Message[]}
 */
export async function getArchiveFromRoom(room) {
  const meta = await (await fetch(`https://holodex.net/api/v2/videos/${room.videoId}`)).json();
  // eslint-disable-next-line no-unused-vars
  const start = Math.floor(new Date(meta.start_actual) / 1000);
  const toJson = r => r.json();
  const script = await fetch(`${MCHAD}/Archive`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      link: room.Link
    })
  }).then(toJson).catch(() => []);

  const firstTime = getFirstTime(script);
  
  const toMessage = mchadToMessage(room.Room, archiveUnixToTimestamp(firstTime), archiveUnixToNumber(firstTime));
  return script.map(toMessage);
}

/** @type {(script: Message[]) => String} */
const getScriptAuthor = script => script[0].author;

/** @type {(arr: Array) => Boolean} */
const isNotEmpty = arr => arr.length != 0;

/** @type {(videoId: String) => Readable<Message>} */
export const getArchive = videoId => readable(null, async set => {
  const { vod } = await getRooms(videoId);
  if (vod.length == 0) return () => { };

  const addUnix = tl => ({...tl, unix: archiveTimeToInt(tl.timestamp)});

  const getScript = room => getArchiveFromRoom(room)
    .then(s => s.map(addUnix))
    .then(s => s.filter(e => e.unix >= 0))
    .then(sortBy('unix'));
  const scripts = await Promise.all(vod.map(getScript))
    .then(scripts => scripts.filter(isNotEmpty));

  scripts.map(getScriptAuthor).forEach(author => {
    mchadUsers.set(author, mchadUsers.get(author));
  });

  const unsubscribes = scripts
    .map(archiveStreamFromScript)
    .map(stream => stream.subscribe(tl => {
      if (tl && enableMchadTLs.get() && !mchadUsers.get(tl.author))
        set(tl);
    }));

  return () => unsubscribes.forEach(u => u());
});

/** @type {(room: String) => Readable<MCHADStreamItem>} */
const streamRoom = room => sseToStream(`${MCHAD}/Listener?room=${room}`);

/** @type {(time: String) => String} */
const removeSeconds = time => time.replace(/:\d\d /, ' ');

/** @type {UnixToTimestamp} */
const liveUnixToTimestamp = unix =>
  removeSeconds(new Date(unix).toLocaleString('en-us').split(', ')[1]);

/** @type {(startUnix: UnixTimestamp) => UnixToTimestamp} */
const archiveUnixToTimestamp = startUnix => unix => formatTimestampMillis(unix - startUnix);

/** @type {(startUnix: UnixTimestamp) => UnixToNumber} */
const archiveUnixToNumber = startUnix => unix => unix - startUnix;

/** @type {(archiveTime: String) => Number} */
const archiveTimeToInt = archiveTime => archiveTime
  .split(':')
  .map(t => parseInt(t))
  .map((t, i) => t * Math.pow(60, 2 - i))
  .reduce((l, r) => l + r);

let mchadTLCounter = 0;

/** @type {(author: String, unixToString: UnixToTimestamp, unixToNumber: UnixToNumber) => (data: MCHADTL) => Message} */
const mchadToMessage = (author, unixToTimestamp, unixToNumber) => data => ({
  text: data.Stext,
  messageArray: [{ type: 'text', text: data.Stext }],
  author,
  authorId: author,
  messageId: ++mchadTLCounter,
  timestamp: unixToTimestamp(data.Stime),
  types: AuthorType.mchad,
  timestampMs: unixToNumber(data.Stime)
});

/** @type {(room: MCHADLiveRoom) => Readable<Message>} */
export const getRoomTranslations = room => derived(streamRoom(room.Nick), (data, set) => {
  if (!enableMchadTLs.get()) return;
  const flag = data?.flag;
  const toMessage = mchadToMessage(room.Nick, liveUnixToTimestamp, (unix) => unix);
  if (flag === 'insert' || flag === 'update') {
    set(toMessage(data.content));
  }
});

/** @type {(videoId: String, retryInterval: Seconds) => MCHADLiveRoom[]} */
const getLiveRoomsWithRetry = async (videoId, retryInterval) => {
  for (;;) {
    const { live } = await getRooms(videoId);
    if (live.length) return live;
    await sleep(retryInterval * 1000);
  }
};

/** @type {(videoId: String) => Readable<Message>} */
export const getLiveTranslations = videoId => readable(null, async set => {
  const rooms = await getLiveRoomsWithRetry(videoId, 30);
  const unsubscribes = rooms.map(room => getRoomTranslations(room).subscribe(msg => {
    if (msg && enableMchadTLs.get() && !mchadUsers.get(msg.author)) {
      set(msg);
    }
  }));
  return () => unsubscribes.forEach(u => u());
});
