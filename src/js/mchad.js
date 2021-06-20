import { MCHAD } from './constants.js';

export async function getRooms(videoID) {
  return {
    live: await (await fetch(`${MCHAD}/Room?link=YT_${videoID}`)).json(),
    vod: await (await fetch(`${MCHAD}/Archive?link=YT_${videoID}`)).json()
  };
}

window.getRooms = getRooms;