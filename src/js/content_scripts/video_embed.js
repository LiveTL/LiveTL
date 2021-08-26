import YouTubeIframeLoader from 'youtube-iframe';

const params = new URLSearchParams(window.location.search);
const video = params.get('video');

if (video) {
  document.body.innerHTML = '<div id="player"></div>';
  document.body.style.overflow = 'hidden';
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
      }
    });
  });
  window.addEventListener('message', event => {
    window.parent.postMessage(event.data, '*');
  });
}
