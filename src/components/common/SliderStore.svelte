<script lang="ts">
  import type { SyncStore } from 'js/storage';
  import Slider from 'smelte/src/components/Slider';
  import Button from './IconButton.svelte';

  /** SyncStore for value updates. */
  export let store: SyncStore<number>;
  /** Whether to show the reset button. Default: true */
  export let showReset = true;
  /** Slider label. */
  export let name = '';
  /** Slider color. Default: 'primary' */
  export let color = 'primary';
  /** Slider disabled state. Default: false */
  export let disabled = false;
  /** Minimum value. Default: 0 */
  export let min = 0;
  /** Maximum value. Default: 100 */
  export let max = 100;
  /** Step value. */
  export let step: number | null = null;

  $: value = $store;
  $: store.set(value);
</script>

<div class="flex flex-row py-1 items-center">
  {#if name !== ''}
    <div>
      {name}:
    </div>
  {/if}
  <div class="flex-1 px-2">
    <Slider bind:value {color} {disabled} {min} {max} {step} />
  </div>
  {#if showReset}
    <div class="flex-none">
      <Button
        icon="refresh"
        on:click={() => store.reset()}
        filled
        noRound
        noPadding
        class="py-px px-3"
      />
    </div>
  {/if}
</div>

<style>
  :global(input[type=range]::-moz-range-thumb) {
    height: 10px;
    width: 10px;
    border: 0;
  }
  :global(input[type=range]:focus::-moz-range-thumb) {
    height: 10px;
    width: 10px;
  }
</style>
