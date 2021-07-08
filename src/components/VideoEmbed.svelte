<script>
  import YouTubeIframeLoader from 'youtube-iframe';
  import { faviconURL, videoSide } from '../js/store.js';
  import { VideoSide } from '../js/constants.js';

  export let videoId;
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
        }
      }
    });
  });
</script>

<div class="wrapper" class:left-video={$videoSide == VideoSide.LEFT}>
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
