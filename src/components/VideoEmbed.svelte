<script lang="ts">
  import type { YTPlayer } from '../ts/youtube-player';
  import { videoSide, faviconURL, videoShortcutAction } from '../js/store.js';
  import { VideoSide } from '../js/constants.js';
  import { onMount, onDestroy } from 'svelte';
  import { loadYoutubePlayer } from '../ts/youtube-player';
  import ProgressCircular from 'smelte/src/components/ProgressCircular';
  import type { Unsubscriber } from 'svelte/store';

  export let videoId: string;

  let tryWorkaround = false;
  let workaroundLoaded = false;
  let listenerActive = false;
  let videoShortcutUnsub: Unsubscriber | null = null;
  let workaroundIframe: HTMLIFrameElement | null = null;

  const setBLFavicon = () => faviconURL.set('/img/blfavicon.ico');

  const onTryWorkaround = (tryWorkaround: boolean): void => {
    if (!tryWorkaround || listenerActive) return;
    window.addEventListener('message', e => {
      if (e.data.type === 'video-embed-loaded') {
        workaroundLoaded = true;
      } else if (e.data.type === 'marine-easter-egg') {
        setBLFavicon();
      }
    });
    listenerActive = true;

    videoShortcutUnsub = videoShortcutAction.subscribe((action) => {
      if (!workaroundIframe || action === '') return;
      workaroundIframe.contentWindow?.postMessage({
        type: 'shortcut-action',
        action
      }, '*');
      videoShortcutAction.set('');
    });
  };

  const onVideoReady = (player: YTPlayer, runPlayerAction: (action: string) => void): void => {
    const state = player.getPlayerState();
    const data = player.getVideoData();
    if (state === -1 && data.title === '' && data.author === '') {
      console.log('Video potentially failed to load normally, trying workaround.');
      tryWorkaround = true;
      return;
    }

    videoShortcutUnsub = videoShortcutAction.subscribe((action) => {
      if (action === '') return;
      runPlayerAction(action);
      videoShortcutAction.set('');
    });
  };

  const onVideoStateChange = (player: YTPlayer): void => {
    if (player.getVideoData().author.includes('Marine Ch.')) {
      setBLFavicon();
    }
  };

  onMount(() => {
    loadYoutubePlayer(
      videoId,
      onVideoReady,
      onVideoStateChange
    );
  });
  onDestroy(() => {
    if (videoShortcutUnsub) videoShortcutUnsub();
  });
  $: onTryWorkaround(tryWorkaround);
</script>

<div
  class:left-video={$videoSide === VideoSide.LEFT}
  class:top-video={$videoSide === VideoSide.TOP}
>
  {#if !tryWorkaround}
    <div class="w-full h-full">
      <div id="player" />
    </div>
  {:else}
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
      bind:this={workaroundIframe}
    />
  {/if}
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
