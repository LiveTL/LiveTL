<script lang="ts">
  import Message from './Message.svelte';
  import MessageRun from './MessageRuns.svelte';
  import { membershipBackground } from '../ts/chat-constants';
  import type { Chat } from '../ts/typings/chat';

  export let message: Ytc.ParsedMessage;
  export let deleted: Chat.MessageDeletedObj | null = null;

  const classes = 'inline-flex flex-col rounded break-words overflow-visible w-full';

  $: membership = message.membership;
  $: membershipGift = message.membershipGiftPurchase;
  $: if (!(membership || membershipGift)) {
    console.error('Not a membership item', { message });
  }
  $: isMilestoneChat = message.message.length > 0;

  let primaryText: Ytc.ParsedRun[];
  const updateText = () => {
    const v = (membership || membershipGift)?.headerPrimaryText;
    primaryText = (v?.length ? v : membership?.headerSubtext) || [];
  };
  $: membership, membershipGift, updateText();
  const backgroundColor = `background-color: #${membershipBackground}`;
</script>

{#if membership ?? membershipGift}
  <div class={classes} style="background-color: #{membershipBackground};">
    <!--
    <div
      class="p-2"
      style="{isMilestoneChat ? `background-color: #${milestoneChatBackground};` : ''}"
    >
      {#if $showProfileIcons}
        <img
          class="h-5 w-5 inline align-middle rounded-full flex-none whitespace-nowrap overflow-hidden mr-1"
          style="text-indent: 100%; max-width: 1.25rem;"
          src={message.author.profileIcon.src}
          alt={message.author.profileIcon.alt}
        />
      {/if}
      <span class="font-bold tracking-wide align-middle mr-3">
        {displayAuthorName}
      </span>
      {#if primaryText && primaryText.length > 0}
        <MessageRun
          class="font-medium mr-3"
          runs={primaryText}
        />
      {/if}
      {#if membership}
        <MessageRun runs={membership.headerSubtext} />
      {/if}
      {#if membershipGift}
        <img
          class="h-10 w-10 float-right"
          src={membershipGift.image.src}
          alt={membershipGift.image.alt}
          title={membershipGift.image.alt} />
      {/if}
    </div>
    {#if isMilestoneChat}
      <div class="p-2">
        <Message message={message} hideName />
      </div>
    {/if} -->
    <Message message={message} {deleted} on:clientSideDelete>
      <span class="{classes} chip text-white" style={backgroundColor} slot="chip">
        <span class="p-1">
          <span class="font-bold">
            {#if primaryText && primaryText.length > 0}
              <MessageRun
                class="font-medium"
                runs={primaryText}
              />
            {/if}
          </span>
        </span>
      </span>
    </Message>
  </div>
{/if}

<style>
  .chip {
    display: inline-block;
    width: fit-content;
    vertical-align: middle;
  }
</style>
