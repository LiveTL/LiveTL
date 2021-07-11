<script>
  import { videoTitle } from '../js/store.js';
  export let continuation;
  export let videoId;
  export let isReplay;
  let iframe;
  let src;
  const extensionId = chrome.runtime.id;
  if (isReplay) {
    src = `https://www.youtube.com/live_chat_replay?continuation=${continuation}&embed_domain=${extensionId}`;
  } else if (videoId) {
    src = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${extensionId}`;
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
      if (iframe && iframe.contentWindow)
        iframe.contentWindow.postMessage(packet.data, '*');
    }
  });
  setInterval(() => {
    if (iframe) {
      iframe.contentWindow.postMessage(
        {
          'yt-live-chat-set-dark-theme': true
        },
        '*'
      );
    }
  }, 100);
</script>

<div class="wrapper">
  <!-- svelte-ignore a11y-missing-attribute -->
  <iframe {src} id="player" bind:this={iframe} />
</div>

<style src="../css/iframe.css"></style>
