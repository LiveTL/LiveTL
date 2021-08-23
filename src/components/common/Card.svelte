<script lang="ts">
  import { noop } from 'svelte/internal';
  // TODO: Might change to material icons font instead of mdi
  import SvgButton from '../../submodules/chat/src/components/common/SvgButton.svelte';
  import Icon from './Icon.svelte';

  export let color = 'dark';
  export let title = '';
  export let titleButtonPath = '';
  export let titleButtonOnClick: (e: MouseEvent) => void = noop;
  export let gap = 2;
  export let icon = '';
  export let addHeaderClasses = '';
  export let headerOnClick: (e: MouseEvent) => void = noop;

  const getContentClasses = (gap: number) => {
    const defaultClasses = 'px-3 flex flex-col';
    if (gap > 0) {
      return defaultClasses + ` gap-${gap}`;
    }
    return defaultClasses;
  };

  $: contentClasses = getContentClasses(gap);
</script>

<div class="rounded bg-{color}-600 ovevrflow-hidden my-3">
  <div
    class="rounded-t p-2 flex flex-row items-center bg-{color}-800 {addHeaderClasses}"
    on:click={headerOnClick}
  >
    <div class="flex-1 pl-2 flex gap-3 items-center">
      <slot name="header-start">
        {#if icon !== ''}
          <Icon>{icon}</Icon>
        {/if}
      </slot>
      <slot name="header-title">
        {#if title !== ''}
          <h6>{title}</h6>
        {/if}
      </slot>
    </div>
    <div class="flex-none self-end">
      <slot name="header-end">
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
  <div class={contentClasses}>
    <slot/>
  </div>
</div>
