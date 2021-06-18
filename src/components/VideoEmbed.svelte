<script>
  import YouTubeIframeLoader from 'youtube-iframe';

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

<div class="wrapper">
  <div id="player" />
</div>

<style src="../css/iframe.css"></style>
