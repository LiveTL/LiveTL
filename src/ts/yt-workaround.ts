import type { YTPlayer } from './youtube-player';
import { loadYoutubePlayer } from './youtube-player';

const params = new URLSearchParams(window.location.search);
const videoId = params.get('video');

if (videoId != null) {
  document.body.innerHTML = '<div id="player" />';
  document.body.style.overflow = 'hidden';
  loadYoutubePlayer(
    videoId,
    (player: YTPlayer, runPlayerAction: (action: string) => void) => {
      window.parent.postMessage({ type: 'video-embed-loaded' }, '*');

      window.addEventListener('message', event => {
        if (event.data.type === 'shortcut-action') {
          runPlayerAction(event.data.action);
        }
      });
    },
    (player: YTPlayer) => {
      if (player.getVideoData().author.includes('Marine Ch.')) {
        window.parent.postMessage({ type: 'marine-easter-egg' }, '*');
      }
    }
  );
  window.addEventListener('message', event => {
    window.parent.postMessage(event.data, '*');
  });
}
