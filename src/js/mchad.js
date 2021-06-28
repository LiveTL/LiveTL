import { MCHAD, AuthorType } from './constants.js';
// eslint-disable-next-line no-unused-vars
import { Message, MCHADTL, MCHADStreamItem, MCHADLiveRoom, MCHADArchiveRoom, UnixTimestamp } from './types.js';
// eslint-disable-next-line no-unused-vars
import { derived, get, readable, Readable } from 'svelte/store';
import { enableMchadTLs, timestamp } from './store.js';
import { combineArr, formatTimestampMillis, sortBy } from './utils.js';
import { archiveStreamFromScript, sseToStream } from './api.js';

/** @typedef {(unix: UnixTimestamp) => String} UnixTransformer */


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
    `${MCHAD}/Room?link=YT_${videoId}`,
    `${MCHAD}/Room?link=https://youtu.be/${videoId}`
  ];

  const vodLinks = [
    `${MCHAD}/Archive?link=YT_${videoId}`,
    `${MCHAD}/Archive?link=https://youtu.be/${videoId}`
  ];

  const [ live, vod ] = await Promise.all([liveLinks, vodLinks].map(getRooms_));

  return { live, vod };
}

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
  const { Stime: firstTime } = [...script, { Stime: 0 }, { Stime: 0 }][1];
  const toMessage = mchadToMessage(room.Room, archiveUnixToTimestamp(firstTime));

  return script.map(toMessage);
}

/** @type {(videoId: String) => Readable<Message>} */
export const getArchive = videoId => readable(null, async set => {
  const { vod } = await getRooms(videoId);
  if (vod.length == 0) return () => { };

  const addUnix = tl => ({...tl, unix: archiveTimeToInt(tl.timestamp)});

  const script = await getArchiveFromRoom(vod[0])
    .then(s => s.map(addUnix))
    .then(sortBy('unix'));

  return archiveStreamFromScript(script).subscribe(tl => {
    if (enableMchadTLs.get())
      set(tl);
  });
});

/** @type {(room: String) => Readable<MCHADStreamItem>} */
const streamRoom = room => sseToStream(`${MCHAD}/Listener?room=${room}`);

/** @type {(time: String) => String} */
const removeSeconds = time => time.replace(/:\d\d /, ' ');

/** @type {UnixTransformer} */
const unixToTimestamp = unix =>
  removeSeconds(new Date(unix).toLocaleString('en-us').split(', ')[1]);

/** @type {(startUnix: UnixTimestamp) => UnixTransformer} */
const archiveUnixToTimestamp = startUnix => unix => formatTimestampMillis(unix - startUnix);

/** @type {(archiveTime: String) => Number} */
const archiveTimeToInt = archiveTime => archiveTime
  .split(':')
  .map(t => parseInt(t))
  .map((t, i) => t * Math.pow(60, 2 - i))
  .reduce((l, r) => l + r);

/** @type {(author: String, timestampTransform: UnixTransformer) => (data: MCHADTL) => Message} */
const mchadToMessage = (author, timestampTransform) => data => ({
  text: data.Stext,
  messageArray: [{ type: 'text', text: data.Stext }],
  author,
  timestamp: timestampTransform(data.Stime),
  types: AuthorType.mchad
});

/** @type {(room: MCHADLiveRoom) => Readable<Message>} */
export const getRoomTranslations = room => derived(streamRoom(room.Nick), (data, set) => {
  if (!enableMchadTLs.get()) return;
  const flag = data?.flag;
  const toMessage = mchadToMessage(room.Nick, unixToTimestamp);
  if (flag === 'insert' || flag === 'update') {
    set(toMessage(data.content));
  }
});

/** @type {(videoId: String) => Readable<Message>} */
export const getLiveTranslations = videoId => readable(null, async set => {
  const { live } = await getRooms(videoId);
  if (live.length == 0) return () => { };
  return getRoomTranslations(live[0]).subscribe(set);
});
