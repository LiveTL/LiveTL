<script>
  import YouTubeIframeLoader from 'youtube-iframe';
  import { videoSide } from '../js/store.js';
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
          if (window.player.getVideoData().author.includes('Marine Ch.')) {
            faviconURL = '/img/blfavicon.ico';
          }
        }
      }
    });
  });

  let faviconURL = '/48x48.png';
</script>


<svelte:head>
  <link rel="icon" href={faviconURL} />
</svelte:head>

<div class="wrapper" class:left-video={$videoSide == VideoSide.LEFT}>
  <div id="player" />
</div>

<!--<style src="../css/iframe.css"></style>-->

<style src="../css/iframe.css">
  /* Add 4px cause otherwise, there is visible grey for some reason */
  .left-video {
    width: calc(100% - var(--bar) + 4px);
  }
</style>
