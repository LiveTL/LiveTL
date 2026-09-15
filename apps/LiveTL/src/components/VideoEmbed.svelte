<script lang="ts">
  import { videoSide, faviconURL, videoShortcutAction } from '../js/store.js';
  import { VideoSide } from '../js/constants.js';
  import { onMount } from 'svelte';
  import ProgressCircular from 'smelte/src/components/ProgressCircular';

  export let videoId: string;

  let workaroundLoaded = false;
  let iframe: HTMLIFrameElement | null = null;

  const setBLFavicon = () => faviconURL.set('/img/blfavicon.ico');

  const onVideoShortcutAction = (action: string): void => {
    if (!iframe || action === '') return;
    iframe.contentWindow?.postMessage({
      type: 'shortcut-action',
      action
    }, '*');
    videoShortcutAction.set('');
  };

  onMount(() => {
    window.addEventListener('message', e => {
      if (e.data.type === 'video-embed-loaded') {
        workaroundLoaded = true;
      } else if (e.data.type === 'marine-easter-egg') {
        setBLFavicon();
      }
    });
  });
  $: onVideoShortcutAction($videoShortcutAction);
</script>

<div
  class:left-video={$videoSide === VideoSide.LEFT}
  class:top-video={$videoSide === VideoSide.TOP}
>
  {#if !workaroundLoaded}
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2">
      <ProgressCircular />
    </div>
  {/if}
  <iframe
    title="video"
    src="https://www.youtube.com/error?video={videoId}"
    class="w-full h-full"
    class:hidden={!workaroundLoaded}
    bind:this={iframe}
  />
</div>

<!--<style src="../css/iframe.css"></style>-->
<style src="../css/iframe.css">
  /* Add 4px cause otherwise, there is visible grey for some reason */
  .left-video {
    width: calc(100% - var(--bar) + 4px);
  }

  .top-video {
    height: calc(100% - var(--bar));
  }
</style>
