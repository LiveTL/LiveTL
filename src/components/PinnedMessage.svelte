<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import Message from './Message.svelte';
  import Tooltip from './common/Tooltip.svelte';
  import Icon from 'smelte/src/components/Icon';
  import { Theme } from '../ts/chat-constants';
  import { createEventDispatcher } from 'svelte';

  export let pinned: Ytc.ParsedPinned;

  let dismissed = false;
  let shorten = false;
  let autoHideTimeout: NodeJS.Timeout | null = null;
  const classes = 'rounded inline-flex flex-col overflow-visible ' +
   'bg-secondary-900 p-2 w-full text-white z-10 shadow';

  const onShorten = () => {
    shorten = !shorten;
    if (autoHideTimeout) {
      clearTimeout(autoHideTimeout);
      autoHideTimeout = null;
    }
  };
  
  $: if (pinned) {
    dismissed = false;
    shorten = false;
    if (pinned.showtime) {
      autoHideTimeout = setTimeout(() => { shorten = true; }, pinned.showtime);
    }
  }

  const dispatch = createEventDispatcher();
  $: dismissed, shorten, dispatch('resize');
</script>

{#if !dismissed}
  <div
    class={classes}
    transition:fade={{ duration: 250 }}
  >
    <div class="flex flex-row items-center cursor-pointer" on:click={onShorten}>
      <div class="font-medium tracking-wide text-white flex-1">
        <span class="mr-1 inline-block" style="transform: translateY(3px);">
          <Icon small>
            {#if shorten}
              expand_more
            {:else}
              expand_less
            {/if}
          </Icon>
        </span>
        {#each pinned.item.header as run}
          {#if run.type === 'text'}
            <span class="align-middle">{run.text}</span>
          {/if}
        {/each}
      </div>
      <div class="flex-none self-end" style="transform: translateY(3px);">
        <Tooltip offsetY={0} small>
          <Icon
            slot="activator"
            class="cursor-pointer text-lg"
            on:click={() => { dismissed = true; }}
          >
            close
          </Icon>
          Dismiss
        </Tooltip>
      </div>
    </div>
    {#if !shorten && !dismissed}
      <div class="mt-1" transition:slide|local={{ duration: 300 }}>
        <Message message={pinned.item.contents} forceDark forceTLColor={Theme.DARK} hideDropdown />
      </div>
    {/if}
  </div>
{/if}
