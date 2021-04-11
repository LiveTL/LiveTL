<script>
  import YouTubeIframeLoader from 'youtube-iframe';
  export let videoId;
  YouTubeIframeLoader.load((YT) => {
    new YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId,
      autoplay: 1,
      playerVars: {
        autoplay: 1,
      },
    });
  });
</script>

<div class="wrapper">
  <div id="player" />
</div>

<style src="../css/iframe.css"></style>
