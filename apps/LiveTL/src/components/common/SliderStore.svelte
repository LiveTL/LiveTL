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
  /** Whether to show the slider value next to its label. Default: true */
  export let showValue = true;
  /** Suffix to add to the shown slider value. Can accept callback with value as parameter. */
  export let showValueSuffix: string | ((v: number) => string) = '';
  /** Multiplier of the shown slider value. Does not affect stored value. Default: 1 */
  export let showValueMultiplier: number = 1;

  $: value = $store;
  $: store.set(value);
  $: showedSuffix = typeof showValueSuffix === 'string'
    ? showValueSuffix
    : showValueSuffix(value);
  $: showedValue = showValueMultiplier !== 1
    ? Math.round(value * showValueMultiplier)
    : value;
</script>

<div class="flex flex-col py-1">
  <div class="flex flex-row gap-2 items-center">
    {#if name !== ''}
      <div>{name}:</div>
    {/if}
    {#if showValue && showedSuffix !== ''}
      <div class="bg-gray-800 rounded px-1 py-px" style="font-size: 0.9em;">
        <code class="bg-gray-700 rounded px-1">{showedValue}</code>
        {showedSuffix}
      </div>
    {:else if showValue}
      <code class="bg-gray-700 rounded px-1 py-px" style="font-size: 0.9em;">
        {showedValue}
      </code>
    {/if}
  </div>
  <div class="flex flex-row items-center">
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
