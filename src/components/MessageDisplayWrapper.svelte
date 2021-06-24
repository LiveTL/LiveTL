<script>
  export let style="";
</script>

<div class="message-display-wrapper" {style}>
  <slot />
</div>

<style>
  .message-display-wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    overflow-x: hidden;
  }
  .message-display-wrapper :global(.message:nth-child(odd)) {
    background-color: rgba(255, 255, 255, 0.075);
  }

  .message-display-wrapper :global(.message:nth-child(even)) {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
