<svelte:options immutable/>

<script>
  import { Message } from '../js/sources.js';
  import { AuthorType } from '../js/constants.js';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-materialify/src';
  import { mdiEyeOffOutline, mdiAccountRemove } from '@mdi/js';
  import '../css/splash.css';

  /** @type {Message} */
  export let message = null;
  export let hidden = false;
  export let showTimestamp = false;

  const dispatch = createEventDispatcher();

  $: moderator = message.types & AuthorType.moderator;
  $: owner = message.types & AuthorType.owner;
  $: timestamp = showTimestamp ? `(${message.timestamp})` : '';
</script>

<div class="message" style="display: {hidden ? 'none': 'block'}">
  <!-- For screenshot checkmark -->
  <slot />

  {#each message.messageArray as msg}
    {#if msg.type === 'text'}
      <span>{msg.text}</span>
    {:else if msg.type === 'link'}
      <a class="chat-link" href={msg.url} target="_blank">{msg.text}</a>
    {:else if msg.type === 'emote' && msg.src}
      <img class="chat-emote" src={msg.src} alt="emote" />
    {/if}
  {/each}

  <span class="info">
    <span class:moderator class:owner>{message.author}</span>
    <span>{timestamp}</span>

    <span class="message-actions">
      <span class="red-highlight" on:click={() => dispatch('hide')}>
        <Icon path={mdiEyeOffOutline} size="1em" />
      </span>

      <span
        class="red-highlight"
        on:click={() => dispatch('ban')}
      >
        <Icon path={mdiAccountRemove} size="1em" />
      </span>
    </span>
  </span>
</div>

<style>
  .message {
    --margin: 5px;
    margin: var(--margin);
    padding: calc(1.5 * var(--margin));
    width: calc(100% - 2 * var(--margin));
    animation: splash 1s normal forwards ease-in-out;
    border-radius: var(--margin);
  }

  .message :global(.s-checkbox) {
    display: inline-flex;
    transform: translate(4px, 3px);
  }

  .message-actions {
    display: none;
  }

  .message:hover .message-actions {
    display: inline-block !important;
    cursor: pointer;
  }

  .message-actions .red-highlight :global(.s-icon:hover) {
    color: #FF2873;
  }

  .moderator {
    color: #A0BDFC !important;
  }

  .owner {
    color: #FFD600 !important;
  }

  .info {
    font-size: 0.75em;
    color: lightgray;
  }

  .chat-link {
    color: var(--theme-text-primary);
  }

  .chat-emote {
    vertical-align: sub;
    height: 1.5em;
    width: 1.5em;
    margin: 0px 0.2em 0px 0.2em;
  }
</style>
