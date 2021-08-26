<script>
  import { videoSide } from '../js/store.js';
  import { VideoSide } from '../js/constants.js';
  import { onMount } from 'svelte';
  let player = undefined;
  export let videoId;
  onMount(() => {
    player.src = `https://www.youtube.com/error?video=${videoId}`;
  });
</script>

<div class="wrapper" class:left-video={$videoSide == VideoSide.LEFT}>
  <iframe title="video" bind:this={player} class="video" />
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
  .video {
    border: 0px;
    margin: 0px;
    width: 100%;
    height: 100%;
  }
</style>
