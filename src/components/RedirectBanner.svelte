<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import MessageRun from './MessageRuns.svelte';
  import Tooltip from './common/Tooltip.svelte';
  import Button from 'smelte/src/components/Button';
  import Icon from 'smelte/src/components/Icon';
  import { Theme } from '../ts/chat-constants';
  import { createEventDispatcher } from 'svelte';
  import { showProfileIcons, showTimestamps } from '../ts/storage';

  export let redirect: Ytc.ParsedRedirect;

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

  $: if (redirect) {
    dismissed = false;
    shorten = false;
    if (redirect.showtime) {
      autoHideTimeout = setTimeout(() => { shorten = true; }, redirect.showtime);
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
        <span class="align-middle">Live Redirect Notice</span>
        {#if redirect.timestamp && $showTimestamps}
          <span class="text-xs ml-1 text-gray-400 dark:text-gray-600 align-middle">
            {redirect.timestamp}
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
      <div class="mt-1 inline-flex flex-row gap-2 break-words w-full overflow-visible" transition:slide|local={{ duration: 300 }}>
        {#if $showProfileIcons}
          <img
            class="h-5 w-5 inline align-middle rounded-full flex-none"
            src={redirect.item.profileIcon.src}
            alt={redirect.item.profileIcon.alt}
          />
        {/if}
        <MessageRun runs={redirect.item.message} forceDark forceTLColor={Theme.DARK}/>
      </div>
      <div class="mt-1 whitespace-pre-line flex justify-end" transition:slide|local={{ duration: 300 }}>
        <Button href={redirect.item.action.url} target="_blank" small>
          <MessageRun runs={redirect.item.action.text} forceDark forceTLColor={Theme.DARK} class="cursor-pointer" />
        </Button>
      </div>
    {/if}
  </div>
{/if}
