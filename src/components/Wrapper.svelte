<script>
  import { afterUpdate, createEventDispatcher } from 'svelte';
  export let isResizing;
  export let zoom = NaN;
  export let verticalCenter = false;
  export let style = '';
  export let smoothScroll = false;
  let factor;
  $: factor = zoom || 1;
  let inverse;
  $: inverse = 100 / factor;

  let div;
  export function isAtBottom() {
    return Math.ceil(div.clientHeight + div.scrollTop) >= div.scrollHeight;
  }
  export function isAtTop(offset=0) {
    return div.scrollTop <= (0 + offset);
  }
  export function scrollToBottom() {
    div.scrollTop = div.scrollHeight - div.clientHeight;
  }
  export function scrollToTop(offset=0) {
    div.scrollTop = 0 + offset;
  }

  const dispatch = createEventDispatcher();
  afterUpdate(() => dispatch('afterUpdate'));
</script>

<div
  style="
    display: {isResizing ? 'none' : 'grid'};
    width: {inverse}%;
    height: {inverse}%;
    transform-origin: 0px 0px;
    transform: scale({factor});
    overflow: auto;
    position: absolute;
    scroll-behavior: {smoothScroll ? 'smooth' : 'auto'};
    scrollbar-width: thin;
    {style}
    "
  bind:this={div}
  on:scroll
  on:wheel
  on:keydown
  tabindex="0"
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
