import { MCHAD, AuthorType } from './constants.js';
import { Message, MCHADTL, MCHADStreamItem, MCHADLiveRoom, MCHADArchiveRoom, UnixTimestamp } from './types.js';
import { derived, readable, Readable } from 'svelte/store';
import { enableMchadTLs } from './store.js';

/**
 * @param {String} videoId 
 * @returns {{ live: MCHADLiveRoom[], vod: MCHADArchiveRoom[] }}
 */
export async function getRooms(videoId) {
  const addVideoId = room => ({...room, videoId});
  const getRoom = link =>
    fetch(link).then(r => r.json()).then(r => r.map(addVideoId)).catch(() => []);

  return {
    live: await getRoom(`${MCHAD}/Room?link=YT_${videoId}`),
    vod: await getRoom(`${MCHAD}/Archive?link=YT_${videoId}`)
  };
}

/**
 * @param {MCHADArchiveRoom} room
 * @returns {Message[]}
 */
export async function getArchive(room) {
  const meta = await (await fetch(`https://holodex.net/api/v2/videos/${room.videoId}`)).json();
  const start = meta.start_actual;
  return await fetch(`${MCHAD}/Archive`, {
    'method': 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    'body': JSON.stringify({
      link: room.Link
    })
  }).then(r => r.json()).catch(() => []).map(mchadToMessage(room.room));
}

/** @type {(room: String) => Readable<MCHADStreamItem>} */
export const streamRoom = room => readable(null, set => {
  /*
    - There will be a ping every 1 minute to keep the connection alive.
    - eventlistener will always try to reconnect even if the connection is cut from the server-side,
      need to call eventlistener.close().
    - incoming data mostly in form of { "flag":"[type of message]", "content":"[content]" },
      it's immediately JSON parseable if you use eventlistener, or if you use traditional
      http.get(), you will need to add "{" and "}" before parsing to JSON.

    Types of incoming data
    -> {} empty json for ping.
    -> flag = Connect, content just a welcome to server stuff to confirm the connection.
    -> flag = Timeout, if no activitiy in the Mchad server for 30 minutes for particular room.
    -> flag = insert, if there's a new entry.
        content contains
            - _id: id of the entry.
            - Stime: unix epoch milisecond when the entry is uploaded to the server.
            - Stext: string text for the translation.
            - CC: Font colour, string in hex "rrggbb" format.
            - OC: Outline colour , string in hex "rrggbb" format.
    -> flag = update, if there's a change on an entry.
        content is the same as [insert], just use _id to find the locally saved entry and overwrite.
  */
  const source = new EventSource(`${MCHAD}/Listener?room=${room}`);
  
  source.onmessage = event => {
    set(JSON.parse(event.data));
  };
  
  return function stop() {
    source.close();
  };
});

/** @type {(time: String) => String} */
const removeSeconds = time => time.replace(/:\d\d /, ' ');

/** @type {(unix: UnixTimestamp) => String} */
const unixToTimestamp = unix =>
  removeSeconds(new Date(unix).toLocaleString('en-us').split(', ')[1]);

/** @type {(author: String) => (data: MCHADTL) => Message} */
const mchadToMessage = author => data => ({
  text: data.Stext,
  messageArray: [{ type: 'text', text: data.Stext }],
  author,
  timestamp: unixToTimestamp(data.Stime),
  types: AuthorType.mchad
});

/** @type {(room: MCHADLiveRoom) => Readable<Message>} */
export const getRoomTranslations = room => derived(streamRoom(room.room), (data, set) => {
  if (!enableMchadTLs.get()) return;
  const flag = data?.flag;
  const toMessage = mchadToMessage(room.room);
  if (flag === 'insert' || flag === 'update') {
    set(toMessage(data));
  }
});

/** @type {(videoId: String) => Readable<Message>} */
export const getLiveTranslations = videoId => readable(null, async set => {
  const { live } = await getRooms(videoId);
  if (live.length == 0) return () => { }
  return getRoomTranslations(live[0]).subscribe(set);
});
