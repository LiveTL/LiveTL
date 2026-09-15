<script>
  import { videoTitle } from '../js/store.js';
  export let continuation;
  export let videoId;
  export let isReplay;
  let iframe;
  let src;
  const extensionId = chrome.runtime.id;
  const chatParams = new URLSearchParams(window.location.search);
  [
    'ytVideo',
    'popout',
    'tabid',
    'frameid',
    'title',
    'embedded',
    'twitchUrl',
    'standalone',
    'isReplay',
  ].forEach(param => chatParams.delete(param));
  chatParams.set('embed_domain', extensionId);
  chatParams.set('dark_theme', 'true');

  if (isReplay) {
    chatParams.set('continuation', continuation);
    chatParams.delete('v');
    src = `https://www.youtube.com/live_chat_replay?${chatParams}`;
  } else if (videoId) {
    chatParams.set('v', videoId);
    chatParams.delete('continuation');
    src = `https://www.youtube.com/live_chat?${chatParams}`;
  }
  window.addEventListener('message', packet => {
    try {
      const data = JSON.parse(packet.data);
      if (data.event === 'infoDelivery') {
        const time = data.info.currentTime;
        iframe.contentWindow.postMessage(
          {
            'yt-player-video-progress': time
          },
          '*'
        );
      }
      if (data.info.videoData) videoTitle.set(data.info.videoData.title);
    } catch (e) {
      if (iframe && iframe.contentWindow && packet.data.type !== 'sendToForeground') {
        iframe.contentWindow.postMessage(packet.data, '*');
      }
    }
  });
</script>

<div class="wrapper">
  <!-- svelte-ignore a11y-missing-attribute -->
  <iframe {src} id="player" bind:this={iframe} />
</div>

<style src="../css/iframe.css"></style>
