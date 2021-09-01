<script>
  import { tick } from 'svelte';
  import html2canvas from 'html2canvas';
  window.html2canvas = html2canvas;
  export let renderQueue = [];
  export let renderWidth;
  let renderElement = null;
  let rendering = false;
  let image = '';
  import Message from './Message.svelte';
  import MessageDisplayWrapper from './MessageDisplayWrapper.svelte';
  import ProgressLinear from 'smelte/src/components/ProgressLinear';
  import Dialog from './common/Dialog.svelte';

  $: if (renderQueue.length) {
    (async () => {
      rendering = true;
      await tick();
      const canvas = await html2canvas(renderElement);
      const base64image = canvas.toDataURL('image/png');
      image = base64image;
      renderQueue = [];
      rendering = false;
    })();
  }
</script>

<div
  class="fixed top-0 left-0 p-1 bg-dark-400"
  bind:this={renderElement}
  style="width: {renderWidth}px; z-index: -1;"
>
  <MessageDisplayWrapper style="flex-direction: column !important;">
    {#each renderQueue.sort((a, b) => a.index - b.index) as item}
      <Message message={item} screenshot />
    {/each}
    <div style="text-align: center; font-size: 0.6em;">
      <strong>Screenshot from LiveTL.</strong>
      Translations may not be accurate.
    </div>
  </MessageDisplayWrapper>
</div>

{#if rendering}
  <div class="fixed z-50 top-0 left-0 w-full">
    <ProgressLinear />
  </div>
{/if}

<Dialog bind:active={image} class="rounded-lg">
  <h5 slot="title">Screenshot</h5>
  <div class="max-h-96 overflow-y-scroll">
    <img
      class="max-w-full mb-3"
      src={image}
      alt="screenshot"
    />
  </div>
  <p class="text-center text-sm">Right click the image to copy, save, etc.</p>
</Dialog>
