<script>
  import { screenshotRenderWidth } from '../js/store.js';
  import { SelectOperation } from '../js/constants.js';
  import TextField from './common/TextField.svelte';
  export let selectedItemCount;
  export let selectOperation;
  export let textFilename;

  let renderWidth = '500';
  let renderWidthInt = null;
  $: renderWidthInt = parseInt(renderWidth);
  $: if (screenshotRenderWidth) {
    screenshotRenderWidth.set(renderWidthInt);
  }
</script>

<h6 class="inline p-2 bg-dark-700 flex-none h-full self-center">
  {selectedItemCount} TLs selected
</h6>
{#if selectOperation === SelectOperation.SCREENSHOT}
  <TextField
    dense
    bind:value={renderWidth}
    rules={[
      { assert: (item) => !isNaN(parseInt(item)), error: 'Invalid width' }
    ]}
    label="Width (px)"
    class="w-28"
  />
{:else if selectOperation === SelectOperation.DOWNLOAD}
  <TextField
    dense
    bind:value={textFilename}
    rules={[{ assert: (item) => item, error: 'Invalid filename' }]}
    label="Filename"
    class="w-60"
  />
{/if}
