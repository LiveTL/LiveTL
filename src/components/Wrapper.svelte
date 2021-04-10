<script>
  export let isResizing;
  export let zoom = NaN;
  export let verticalCenter = false;
  let factor;
  $: factor = zoom || 1;
  let inverse;
  $: inverse = 100 / factor;
</script>

<div
  style="
    display: {isResizing
    ? 'none'
    : 'grid'};
    width: {inverse}%;
    height: {inverse}%;
    transform-origin: 0px 0px;
    transform: scale({factor});
    overflow: auto;
    position: absolute;
    "
>
  <slot />
</div>

<style>
  /* width */

  :global(::-webkit-scrollbar) {
    width: 4px;
    height: 4px;
  }

  /* Track */

  :global(::-webkit-scrollbar-track) {
    background: transparent;
  }

  /* Handle */

  :global(::-webkit-scrollbar-thumb) {
    background: #888;
  }

  /* Handle on hover */

  :global(::-webkit-scrollbar-thumb:hover) {
    background: #555;
  }
</style>
