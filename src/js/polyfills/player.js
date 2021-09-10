import { readable } from 'svelte/store';

const windowMessage = readable(null, set => {
  window.addEventListener('message', set);
  return () => window.removeEventListener('message', set);
});

export const player = new Proxy({}, { get(_target, fn, _receiver) {
  const ytPlayerFrame = document.querySelector('iframe[title=video]');
  return (...args) => new Promise((res, rej) => {
    if (ytPlayerFrame == null) return rej(new Error('Youtube player frame not found'));

    const unsub = windowMessage.subscribe(e => {
      if (e?.data?.type !== 'yt-player-function-return') return;
      // unsub may not be declared yet
      setTimeout(() => {
        unsub();
      });
      res(e.data.result);
    });

    ytPlayerFrame.contentWindow.postMessage({
      type: 'yt-player-function-call', fn, args
    }, '*');
  });
}});

window.ytplayer = player;
window.player = player;
