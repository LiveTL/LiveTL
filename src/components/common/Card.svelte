<script lang="ts">
  import { noop } from 'svelte/internal';
  import Icon from './Icon.svelte';

  export let title = '';
  export let headerEndIcon = '';
  export let headerEndIconOnClick: (e: MouseEvent) => void = noop;
  export let noGap = false;
  export let icon = '';
  export let addHeaderClasses = '';
  export let headerOnClick: (e: MouseEvent) => void = noop;
  export let nested = false;
  export let margin = true;
  export let bgColor = '';
  export let padded = true;
  export let clearBg = false;

  $: contentClasses = `${padded ? 'px-3 py-2' : ''} flex flex-col ${noGap ? '' : 'gap-2'}`;
</script>

<div
  class="rounded {margin ? 'my-2' : ''} {clearBg
    ? ''
    : nested
    ? 'bg-dark-500'
    : 'bg-dark-600'}"
>
  <div
    class="rounded-t p-2 flex flex-row items-center {bgColor || 'bg-dark-400'} {addHeaderClasses}"
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
    <div class="flex-none self-center">
      <slot name="header-end">
        {#if headerEndIcon !== ''}
          <Icon on:click={headerEndIconOnClick} class="cursor-pointer">
            {headerEndIcon}
          </Icon>
        {/if}
      </slot>
    </div>
  </div>
  <div class={contentClasses}>
    <slot/>
  </div>
</div>
