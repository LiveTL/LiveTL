<script lang="ts">
  export let style = '';
</script>

<div class="message-display-wrapper h-full w-full flex overflow-x-hidden bg-dark-700" {style}>
  <slot />
</div>
