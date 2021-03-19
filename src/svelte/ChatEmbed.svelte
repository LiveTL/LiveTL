<script>
  export let continuation;
  export let videoId;
  export let isReplay;
  let src;
  if (isReplay)
    src = `https://www.youtube.com/live_chat_replay?continuation=${continuation}`;
  else if (videoId) src = `https://www.youtube.com/live_chat?v=${videoId}`;
</script>

<div class="wrapper">
  <iframe {src} id="player" />
</div>

<style src="../css/iframe.css"></style>
