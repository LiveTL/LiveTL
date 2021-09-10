import YouTubeIframeLoader from 'youtube-iframe';
import { clamp, suppress } from '../utils.js';

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
    window.parent.postMessage(event.data, '*');

    const player = window.player;
    if (event?.data?.type === 'shortcut-action') {
      switch (event?.data?.action) {
      case 'volumeUp':
        player.setVolume(clamp(player.getVolume() + 10, 0, 100));
        break;
      case 'volumeDown':
        player.setVolume(clamp(player.getVolume() - 10, 0, 100));
        break;
      case 'fullScreen':
        // TODO
        break;
      case 'mute':
        player.mute();
        break;
      case 'togglePlayPause':
        {
          const paused = player.getPlayerState() == 2;
          paused ? player.playVideo() : player.pauseVideo();
        }
        break;
      default:
        console.debug('Got unknown shortcut action', action);
        break;
      }
    }
  });
}
