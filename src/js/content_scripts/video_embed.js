import YouTubeIframeLoader from 'youtube-iframe';
import { suppress } from '../utils.js';

const params = new URLSearchParams(window.location.search);
const video = params.get('video');

if (video) {
  document.body.innerHTML = '<div id="player"></div>';
  document.body.style.overflow = 'hidden';
  window.parent.postMessage({
    type: 'video-embed-loaded'
  }, '*');
  YouTubeIframeLoader.load(YT => {
    window.player = new YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId: video,
      autoplay: 1,
      playerVars: {
        autoplay: 1,
        fs: 0
      },
      events: {
        onStateChange() {
          suppress(() => {
            const data = window?.player?.getVideoData();
            if (data?.author?.includes('Marine Ch.')) {
              window.parent.postMessage({
                type: 'marine-easter-egg'
              }, '*');
            }
          });
        }
      }
    });
  });
  window.addEventListener('message', event => {
    window.parent.postMessage(event?.data, '*');
    switch (event?.data?.type) {
    case 'yt-player-function-call':
    {
      const { fn, args } = event.data;
      const result = JSON.parse(JSON.stringify(window.player[fn](...args)));
      window.parent.postMessage({
        type: 'yt-player-function-return', result
      }, '*');
    }
    }
  });
}
