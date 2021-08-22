<svelte:options immutable />

<script lang="ts">
  import { AuthorType } from '../js/constants.js';
  import { createEventDispatcher } from 'svelte';
  import { spotlightedTranslator } from '../js/store.js';
  import '../css/splash.css';
  import Chip from 'smelte/src/components/Chip';
  import Icon from 'smelte/src/components/Icon';
  import Menu from './common/Menu.svelte';

  // TODO: test mchad & deletion

  export let message: Ltl.Message;
  export let hidden = false;
  export let showTimestamp = false;
  export const thin = false;
  export const inanimate = true;
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
</script>

{#if !hidden}
  <div
    class="flex flex-row gap-2 m-1 p-1 rounded bg-gray-800 text-base items-center"
    on:mouseover={() => (focused = true)}
    on:focus={() => (focused = true)}
    on:mouseout={() => (focused = false)}
    on:blur={() => (focused = false)}
  >
    <div class="flex-none">
      <!-- For screenshot checkmark -->
      <slot />
    </div>
    <div class="flex-1">
      <!-- Message content-->
      <span class="mr-1">
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
              <img class="h-5 w-5 mx-px inline" src={msg.src} alt={msg.alt} />
          {/if}
        {/each}
      </span>
      <!-- Author & timestamp -->
      <span class="text-sm text-gray-700 dark:text-gray-400">
        <span class="{nameColorClass} inline-block">{message.author}</span>
        {#if mchad}
          <span>
            <Chip icon="check_circle" selectable={false}>Mchad TL</Chip>
          </span>
        {/if}
        <span>{timestamp}</span>
      </span>
    </div>
    <!-- Menu -->
    <Menu items={menuItems} visible={focused}>
      <Icon slot="activator" class="block">more_vert</Icon>
    </Menu>
  </div>
{/if}
