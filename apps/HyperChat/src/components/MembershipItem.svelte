<script lang="ts">
  import Message from './Message.svelte';
  import MessageRun from './MessageRuns.svelte';
  import { formatAuthorName } from '../ts/component-utils';
  import { showProfileIcons, showTimestamps } from '../ts/storage';
  import { membershipBackground, milestoneChatBackground } from '../ts/chat-constants';

  export let message: Ytc.ParsedMessage;

  const classes = 'relative inline-flex flex-col rounded break-words overflow-hidden w-full text-white';

  $: membership = message.membership;
  $: membershipGift = message.membershipGiftPurchase;
  $: if (!(membership || membershipGift)) {
    console.error('Not a membership item', { message });
  }
  $: isMilestoneChat = message.message.length > 0;
  $: displayAuthorName = formatAuthorName(message.author.name);

  $: primaryText = (membership ?? membershipGift)?.headerPrimaryText;
</script>

{#if membership ?? membershipGift}
  <div class={classes} style="background-color: #{membershipBackground};">
    {#if membershipGift}
      <img
        class="absolute inset-y-0 right-0 h-full w-auto pointer-events-none select-none z-0"
        style="opacity: 0.4;"
        src={membershipGift.image.src}
        alt=""
        aria-hidden="true" />
    {/if}
    <div
      class="p-2 relative z-10"
      style="{isMilestoneChat ? `background-color: #${milestoneChatBackground};` : ''}"
    >
      {#if $showProfileIcons}
        <img
          class="h-5 w-5 inline align-middle rounded-full flex-none mr-1"
          src={message.author.profileIcon.src}
          alt={message.author.profileIcon.alt}
        />
      {/if}
      {#if $showTimestamps}
        <span class="mr-1 text-xs opacity-75 align-middle">{message.timestamp}</span>
      {/if}
      <span class="font-bold tracking-wide align-middle">
        {displayAuthorName}
      </span>
      {#if membership}
        <MessageRun class="float-right align-middle ml-2" runs={membership.headerSubtext} />
      {/if}
      {#if primaryText && primaryText.length > 0}
        <MessageRun class="font-medium block clear-both" runs={primaryText} />
      {/if}
    </div>
    {#if isMilestoneChat}
      <div class="p-2 relative z-10">
        <Message message={message} hideName />
      </div>
    {/if}
  </div>
{/if}
