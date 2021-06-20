import { MCHAD } from './constants.js';
import { derived, readable } from 'svelte/store';

export async function getRooms(videoID) {
  return {
    live: await (await fetch(`${MCHAD}/Room?link=YT_${videoID}`)).json(),
    vod: await (await fetch(`${MCHAD}/Archive?link=YT_${videoID}`)).json()
  };
}

export const streamRoom = room => readable(null, set => {
  const source = new EventSource(`${MCHAD}/Listener?room=${room}`);
  
  source.onmessage = event => {
    set(JSON.parse(event.data))
  }
  
  return function stop() {
    source.close();
  }
});

export const getRoomTranslations = room => derived(streamRoom(room), (data, set) => {
  if (data?.flag == 'insert') {
    set(data.Stext);
  }
});
