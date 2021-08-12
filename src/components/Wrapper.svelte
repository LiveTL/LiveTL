<script>
  import { delayed } from '../js/utils.js';

  import { isResizing } from '../js/store.js';
  export let zoom = NaN;
  export let style = '';
  let factor;
  $: factor = parseFloat(zoom.toFixed(2)) || 1;
  let inverse;
  $: inverse = 100 / factor;

  let div;

  // Add 5 as a safety since without it, #257 is caused
  export const isAtBottom = delayed(() =>
    Math.ceil(div.clientHeight + div.scrollTop + 5) >= div.scrollHeight,
  true
  );

  export const isAtTop = delayed(() => div.scrollTop === 0, true);

  $: displayProperty = $isResizing ? 'none' : 'grid';
</script>

<div
  style="
    display: {displayProperty};
    width: {inverse}%;
    height: {inverse}%;
    transform-origin: 0px 0px;
    transform: scale({factor});
    overflow: auto;
    position: absolute;
    scrollbar-width: thin;
    {style}
    "
  bind:this={div}
  on:scroll
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
