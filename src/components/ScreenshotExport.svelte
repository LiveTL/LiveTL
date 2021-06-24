<script>
  import { tick } from 'svelte';
  import html2canvas from 'html2canvas';
  window.html2canvas = html2canvas;
  export let renderQueue = [];
  export let renderWidth;
  let renderElement = null;
  let rendering = false;
  let image = '';
  import { ProgressLinear } from 'svelte-materialify/src';
  import Dialog from './Dialog.svelte';
  import Message from "./Message.svelte";
  import MessageDisplayWrapper from "./MessageDisplayWrapper.svelte";
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
  import {
    AuthorType
  } from '../js/constants.js';
</script>

<div
  bind:this={renderElement}
  id="renderElement"
  style="width: {renderWidth}px;"
>
  <MessageDisplayWrapper style="flex-direction: column !important;">
    {#each renderQueue.sort((a, b) => a.index - b.index) as item}
      <Message message={item} thin />
    {/each}
    <div style="text-align: center; font-size: 0.6em;">
      <strong>Screenshot from LiveTL.</strong>
      Translations may not be accurate.
    </div>
  </MessageDisplayWrapper>
</div>
{#if rendering}
  <div style="z-index: 100; top: 0; left: 0; width: 100%; position: fixed;">
    <ProgressLinear color="blue" backgroundColor="secondary" indeterminate />
  </div>
{/if}
<Dialog bind:active={image}>
  <h6 style="text-align: left;">Screenshot</h6>
  <img
    style="max-width: 100%; margin-top: 10px;"
    src={image}
    alt="screenshot"
  />
  <h6 style="text-align: center; font-size: 0.75em;">
    Right click the image to copy, save, etc.
  </h6>
</Dialog>

<style>
  #renderElement {
    background-color: var(--theme-surface);
    z-index: -1;
    position: fixed;
    top: 0px;
    left: 0px;
    padding: 2.5px 5px 2.5px 5px;
  }
</style>
