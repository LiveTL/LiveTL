<script>
  import { videoSide, faviconURL } from '../js/store.js';
  import { VideoSide } from '../js/constants.js';
  import { suppress } from '../js/utils.js';
  import { onMount } from 'svelte';
  import { ProgressCircular } from 'svelte-materialify';
  let player = undefined;
  export let videoId;
  let loaded = false;
  onMount(() => {
    player.src = `https://www.youtube.com/error?video=${videoId}`;
    window.addEventListener('message', e => {
      suppress(() =>{
        if (e.data.type === 'marine-easter-egg') {
          faviconURL.set('/img/blfavicon.ico');
        } else if (e.data.type === 'video-embed-loaded') {
          loaded = true;
        }
      });
    });
  });
</script>

{#if !loaded}
  <div class="progress">
    <ProgressCircular indeterminate color="primary" />
  </div>
{/if}
<div class="wrapper" class:left-video={$videoSide == VideoSide.LEFT}>
  <iframe
    title="video"
    bind:this={player}
    class="video"
    class:hidden={!loaded}
  />
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
  .hidden {
    opacity: 0% !important;
  }
  .progress {
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
</style>
