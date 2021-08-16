<script lang="ts">
  import type { SyncStore } from 'js/storage';
  import { mdiRestore } from '@mdi/js';
  import { Slider } from 'smelte';
  import SvgButton from '../../submodules/chat/src/components/common/SvgButton.svelte';

  export let store: SyncStore<number>;
  export let showReset = true;

  export let name = '';
  export let color = 'primary';
  export let disabled = false;
  export let min = 0;
  export let max = 100;
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
      <SvgButton
        path={mdiRestore}
        on:click={() => store.reset()}
        round={false}
        size="20px"
        yPadding="px"
        xPadding="3"
      />
    </div>
  {/if}
</div>
