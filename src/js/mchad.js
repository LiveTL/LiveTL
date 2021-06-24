import { MCHAD, AuthorType } from './constants.js';
import { derived, readable } from 'svelte/store';

/**
 * @param {String} videoId 
 * @returns {{ live: [Object], vod: [Object] }}
 */
export async function getRooms(videoId) {
  const f = d => {
    d.videoId = videoId;
    return d;
  };
  return {
    live: await (await fetch(`${MCHAD}/Room?link=YT_${videoId}`)).json().map(f),
    vod: await (await fetch(`${MCHAD}/Archive?link=YT_${videoId}`)).json().map(f)
  };
}

/**
 * @param {Object} entry 
 * @returns {[{ text: String, time: number }] | undefined }
 */
export async function getArchive(entry) {
  try {
    const meta = await (await fetch(`https://holodex.net/api/v2/videos/${entry.videoId}`)).json();
    const start = meta.start_actual;
    return await (await fetch(`${MCHAD}/Archive`, {
      'method': 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      'body': JSON.stringify({
        link: entry.Link
      })
    })).json().map(d => ({
      text: d.Stext,
      time: (new Date(d.Stime) - new Date(start))/1000
    }));
  } catch(e) {
    return undefined;
  }
}

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

const removeSeconds = time => time.replace(/:\d\d /, ' ');

const unixToTimestamp = unix =>
  removeSeconds(new Date(unix).toLocaleString('en-us').split(', ')[1]);

export const getRoomTranslations = room => derived(streamRoom(room), (data, set) => {
  const flag = data?.flag;
  if (flag === 'insert' || flag === 'update') {
    set({
      text: data.Stext,
      messageArray: [{ type: 'text', text: data.Stext }],
      author: 'MCHAD', // TODO find the actual author
      timestamp: unixToTimestamp(data.Stime),
      types: AuthorType.mchad
    });
  }
});
