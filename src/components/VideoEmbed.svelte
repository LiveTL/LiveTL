<script>
  import YouTubeIframeLoader from 'youtube-iframe';
  import { faviconURL, videoSide } from '../js/store.js';
  import { VideoSide } from '../js/constants.js';

  export let videoId;
  let videoEmbedWrapper;
  YouTubeIframeLoader.load(YT => {
    window.player = new YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId,
      autoplay: 1,
      playerVars: {
        autoplay: 1
      },
      events: {
        onStateChange() {
          const data = window.player.getVideoData();
          if (data.author.includes('Marine Ch.')) {
            faviconURL.set('/img/blfavicon.ico');
          }
        },
        onReady() {
          videoEmbedWrapper.querySelector('iframe').contentWindow.postMessage({
            event: 'initFullscreenListener'
          }, '*');
        }
      }
    });
  });


  function toggleFullScreen() {
    if (
      (document.fullScreenElement && document.fullScreenElement !== null) ||
      (!document.mozFullScreen && !document.webkitIsFullScreen)
    ) {
      if (document.documentElement.requestFullScreen) {
        document.documentElement.requestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
        document.documentElement.webkitRequestFullScreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  window.addEventListener('message', data => {
    if (data.data.event == 'fullscreen') {
      toggleFullScreen();
    }
  });
</script>

<div
  class="wrapper"
  class:left-video={$videoSide == VideoSide.LEFT}
  bind:this={videoEmbedWrapper}
>
  <div id="player" />
</div>

<!--<style src="../css/iframe.css"></style>-->
<style src="../css/iframe.css">
  /* Add 4px cause otherwise, there is visible grey for some reason */
  .left-video {
    width: calc(100% - var(--bar) + 4px);
  }
  .wrapper {
    overflow: hidden;
  }
</style>
