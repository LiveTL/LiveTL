<svelte:options immutable />

<script lang="ts">
  import { AuthorType } from '../js/constants.js';
  import { createEventDispatcher } from 'svelte';
  import { spotlightedTranslator, isSelecting } from '../js/store.js';
  import '../css/splash.css';
  import Icon from './common/Icon.svelte';
  import Menu from './common/Menu.svelte';

  export let message: Ltl.Message;
  export let hidden = false;
  export let showTimestamp = false;
  export let screenshot = false;
  export let deleted = false;
  export let messageArray: Ytc.ParsedRun[] = [];
  let focused = false;

  const dispatch = createEventDispatcher();
  const dispatcher = (name: string) => () => dispatch(name, message);
  const generateNameColorClass = (moderator: number, owner: number) => {
    if (owner) {
      return 'text-owner-light dark:text-owner-dark';
    } else if (moderator) {
      return 'text-moderator-light dark:text-moderator-dark';
    } else {
      return '';
    }
  };
  const updateMenuItems = (spotlightedTranslator: unknown, message: Ltl.Message) => {
    return [
      {
        icon: spotlightedTranslator ? 'voice_over_off' : 'record_voice_over',
        value: 'spotlight',
        text: spotlightedTranslator ? 'Show other translators' : `Only show ${message.author}`,
        onClick: dispatcher('spotlight')
      },
      {
        icon: 'visibility_off',
        value: 'hide',
        text: 'Hide message',
        onClick: dispatcher('hide')
      },
      {
        icon: 'block',
        value: 'ban',
        text: `Ban ${message.author}`,
        onClick: dispatcher('ban')
      }
    ];
  };

  $: menuItems = updateMenuItems($spotlightedTranslator, message);
  $: if (messageArray.length < 1 && message) {
    messageArray = message.messageArray;
  }

  $: moderator = message.types & AuthorType.moderator;
  $: owner = message.types & AuthorType.owner;
  $: mchad = message.types & AuthorType.mchad;

  $: timestamp = showTimestamp ? `(${message.timestamp})` : '';
  $: nameColorClass = generateNameColorClass(moderator, owner);
  $: deletedClass = deleted ? 'text-deleted-light dark:text-deleted-dark italic' : '';
  $: classes = 'message flex flex-row m-1 rounded bg-gray-800 items-center ' +
    `${screenshot ? 'animate-none p-1' : 'py-2'}`;
</script>

{#if !hidden}
  <div
    class={classes}
    on:mouseover={() => (focused = true)}
    on:focus={() => (focused = true)}
    on:mouseout={() => (focused = false)}
    on:blur={() => (focused = false)}
    style="font-size: 1em;"
  >
    <div class="flex-none">
      <!-- For screenshot checkmark -->
      <slot />
    </div>
    <div class="flex-1 mx-2">
      <!-- Message content-->
      <span class="message-content mr-1 text-white align-middle">
        {#each messageArray as msg}
          {#if msg.type === 'text'}
            <span class={deletedClass}>{msg.text}</span>
          {:else if msg.type === 'link'}
            <a
              class="underline inline"
              href={msg.url}
              target="_blank"
            >
              {msg.text}
            </a>
            {:else if msg.type === 'emoji' && msg.src}
              <img class="mx-px inline" style="max-height: 1.25em" src={msg.src} alt={msg.alt} />
          {/if}
        {/each}
      </span>
      <!-- Author & timestamp -->
      <span class="message-info text-gray-700 dark:text-gray-400" style="font-size: 0.75em;">
        <span class="{nameColorClass} inline-block align-middle">{message.author}</span>
        {#if mchad}
          <span class="bg-gray-700 px-1 rounded inline-block text-gray-300 align-middle">
            <Icon block={false} class="inline align-middle" small>check_circle</Icon> TLdex
          </span>
        {/if}
        <span class="inline-block align-middle">{timestamp}</span>
      </span>
    </div>
    <!-- Menu -->
    {#if !screenshot && !$isSelecting}
      <Menu items={menuItems} visible={focused} class="mr-2">
        <Icon slot="activator" style="font-size: 1.25em;">more_vert</Icon>
      </Menu>
    {/if}
  </div>
{/if}
