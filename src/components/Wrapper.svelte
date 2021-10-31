<script>
  import { delayed } from '../js/utils.js';
  import { isResizing } from '../js/store.js';

  export let zoom = NaN;

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

  $: style = 'scrollbar-width: thin; scrollbar-color: #888 transparent; ' +
    `width: ${inverse}%; height: ${inverse}%; transform: scale(${factor}); ` +
    ($$props.style ? $$props.style : '');
</script>

<div
  class="overflow-auto origin-top-left absolute {$isResizing ? 'hidden' : 'grid'}"
  {style}
  bind:this={div}
  on:scroll
>
  <slot />
</div>

<style>
  :global(::-webkit-scrollbar) {
    width: 4px;
    height: 4px;
  }
  :global(::-webkit-scrollbar-track) {
    background: transparent;
  }
  :global(::-webkit-scrollbar-thumb) {
    background: #888;
  }
  :global(::-webkit-scrollbar-thumb:hover) {
    background: #555;
  }
</style>
