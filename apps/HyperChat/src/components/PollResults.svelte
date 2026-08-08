<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import MessageRun from './MessageRuns.svelte';
  import Tooltip from './common/Tooltip.svelte';
  import Icon from 'smelte/src/components/Icon';
  import { Theme } from '../ts/chat-constants';
  import { createEventDispatcher } from 'svelte';
  import { showProfileIcons } from '../ts/storage';
  import ProgressLinear from 'smelte/src/components/ProgressLinear';

  export let poll: Ytc.ParsedPoll;

  let dismissed = false;
  let shorten = false;
  let prevId: string | null = null;
  const classes = 'rounded inline-flex flex-col overflow-visible ' +
   'bg-secondary-900 p-2 w-full text-white z-10 shadow';

  const onShorten = () => {
    shorten = !shorten;
  };
  
  $: if (poll.actionId !== prevId) {
    dismissed = false;
    shorten = false;
    prevId = poll.actionId;
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
        {#if $showProfileIcons}
          <img
            class="h-5 w-5 inline align-middle rounded-full flex-none"
            src={poll.item.profileIcon.src}
            alt={poll.item.profileIcon.alt}
          />
        {/if}
        {#each poll.item.header as run}
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
      <div class="mt-1 inline-flex flex-row gap-2 break-words w-full overflow-visible" transition:slide|local={{ duration: 300 }}>
        <MessageRun runs={poll.item.question} forceDark forceTLColor={Theme.DARK}/>
      </div>
      {#each poll.item.choices as choice}
        <div class="mt-1 w-full whitespace-pre-line flex justify-start items-end" transition:slide|global={{ duration: 300 }}>
          <MessageRun runs={choice.text} forceDark forceTLColor={Theme.DARK} />
          <span class="ml-auto" transition:slide|global={{ duration: 300 }}>
            {choice.percentage}
          </span>
        </div>
        <ProgressLinear progress={(choice.ratio || 0.001) * 100} color="gray"/>
      {/each}
    {/if}
  </div>
{/if}
