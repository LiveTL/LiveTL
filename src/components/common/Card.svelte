<script lang="ts">
  import { noop } from 'svelte/internal';
  import SvgButton from '../../submodules/chat/src/components/common/SvgButton.svelte';

  export let color = 'dark';
  export let title = '';
  export let titleButtonPath = '';
  export let titleButtonOnClick: (e: MouseEvent) => void = noop;
</script>

<div class="rounded bg-{color}-600 ovevrflow-hidden my-3">
  <div class="rounded-t p-2 flex flex-row items-center bg-{color}-800">
    <div class="flex-1 pl-2">
      <slot name="title">
        {#if title !== ''}
          <h6>{title}</h6>
        {/if}
      </slot>
    </div>
    <div class="flex-none self-end">
      <slot name="title-button">
        {#if titleButtonPath !== ''}
          <SvgButton
            transparent
            path={titleButtonPath}
            on:click={titleButtonOnClick}
            color="white"
          />
        {/if}
      </slot>
    </div>
  </div>
  <div class="px-3 flex flex-col gap-2">
    <slot/>
  </div>
</div>
