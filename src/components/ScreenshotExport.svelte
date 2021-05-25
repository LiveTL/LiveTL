<script>
  import { tick } from "svelte";
  import html2canvas from 'html2canvas';
  window.html2canvas = html2canvas;
  export let renderQueue = [];
  export let renderWidth;
  let renderElement = null;
  let rendering = false;
  let image = '';
  import { ProgressLinear } from 'svelte-materialify/src';
  import Dialog from "./Dialog.svelte";
  $: if (renderQueue.length) {
    (async () => {
      await tick();
      rendering = true;
      const canvas = await html2canvas(renderElement);
      const base64image = canvas.toDataURL("image/png");
      image = base64image;
      renderQueue = [];
      rendering = false;
    })();
  }
</script>

<div
  bind:this={renderElement}
  id="renderElement"
  style="width: {renderWidth}px;"
>
  {#each renderQueue as item}
    <div>
      <span>{item.text}</span>
      <span class="author">{item.author}</span>
    </div>
  {/each}
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
    background-color: white;
    color: black;
    z-index: -1;
    position: fixed;
    top: 0px;
    left: 0px;
    padding: 10px;
  }
  .author {
    font-size: 0.75em;
  }

</style>
