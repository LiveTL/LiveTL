<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import MessageRun from './MessageRuns.svelte';
  import Tooltip from './common/Tooltip.svelte';
  import Icon from 'smelte/src/components/Icon';
  import { Theme } from '../ts/chat-constants';
  import { createEventDispatcher } from 'svelte';
  import { showTimestamps } from '../ts/storage';

  export let summary: Ytc.ParsedSummary;

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

  $: if (summary) {
    dismissed = false;
    shorten = false;
    if (summary.showtime) {
      autoHideTimeout = setTimeout(() => { shorten = true; }, summary.showtime);
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
        {#each summary.item.header as run}
          {#if run.type === 'text'}
            <span class="align-middle">{run.text}</span>
          {/if}
        {/each}
        {#if summary.timestamp && $showTimestamps}
          <span class="text-xs ml-1 text-gray-400 dark:text-gray-600 align-middle">
            {summary.timestamp}
          </span>
        {/if}
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
      <div class="mt-1 whitespace-pre-line" transition:slide|local={{ duration: 300 }}>
        <MessageRun runs={summary.item.subheader} deleted forceDark forceTLColor={Theme.DARK}/>
      </div>
      <div class="mt-1 whitespace-pre-line" transition:slide|local={{ duration: 300 }}>
        <MessageRun runs={summary.item.message} forceDark forceTLColor={Theme.DARK}/>
      </div>
    {/if}
  </div>
{/if}
