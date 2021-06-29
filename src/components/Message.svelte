<svelte:options immutable />

<script>
  // eslint-disable-next-line no-unused-vars
  import { Message } from '../js/types.js';
  import { AuthorType } from '../js/constants.js';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-materialify/src';
  import { mdiEyeOffOutline, mdiAccountRemove, mdiCheckCircle } from '@mdi/js';
  import '../css/splash.css';

  /** @type {Message} */
  export let message = null;
  export let hidden = false;
  export let showTimestamp = false;
  export let thin=false;

  const dispatch = createEventDispatcher();

  $: moderator = message.types & AuthorType.moderator;
  $: owner = message.types & AuthorType.owner;
  $: timestamp = showTimestamp ? `(${message.timestamp})` : '';
</script>

<div class="message" class:thin style="display: {hidden ? 'none' : 'block'}">
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
    {#if message.types & AuthorType.mchad}
      <span class="mchad"
        ><Icon path={mdiCheckCircle} size="1em" /> Mchad TL</span
      >
    {/if}
    <span>{timestamp}</span>
    <span class="message-actions">
      <span class="red-highlight" on:click={() => dispatch('hide')}>
        <Icon path={mdiEyeOffOutline} size="1em" />
      </span>

      <span class="red-highlight" on:click={() => dispatch('ban')}>
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

  .thin {
    --margin: 2px !important;
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
    color: #ff2873;
  }

  .moderator {
    color: #a0bdfc !important;
  }

  .owner {
    color: #ffd600 !important;
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

  .mchad {
    background-color: rgba(255, 255, 255, 0.25);
    padding: 2px;
    border-radius: 5px;
  }
</style>
