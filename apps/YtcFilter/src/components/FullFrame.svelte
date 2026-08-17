<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { dataTheme } from '../ts/storage';
  export let src: string;
  const postMessageListener = (event: any) => {
    if (event.data.type === 'archiveViewCloseRequest') {
      src = '';
    }
  };
  onMount(() => {
    window.addEventListener('message', postMessageListener);
  });
  onDestroy(() => {
    window.removeEventListener('message', postMessageListener);
  });
  const toggleScroll = () => {
    const html = document.querySelector('html');
    if (html) {
      html.style.overflow = src ? 'hidden' : 'auto';
    }
  };
  $: src, toggleScroll();
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<iframe
  {src}
  style="background-color: {$dataTheme === 'dark' ? 'black' : 'white'}; display: {src ? 'block' : 'none'};"
  class="archive-frame"
/>

<style>
  .archive-frame {
    border: 0px;
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 10000;
  }
</style>
