<script>
  import YouTubeIframeLoader from "youtube-iframe";
  export let videoId;
  YouTubeIframeLoader.load((YT) => {
    new YT.Player("player", {
      height: "100%",
      width: "100%",
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

<style>
  #player {
    border: 0;
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
  .wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
