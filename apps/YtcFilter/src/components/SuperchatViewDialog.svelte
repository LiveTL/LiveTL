<script lang="ts">
  import { slide } from 'svelte/transition';
  import Icon from 'smelte/src/components/Icon';
  import {
    focusedSuperchat,
    port,
    activeReplyThreadId,
    liveReplyBuffer,
    liveLikeCounts
  } from '../ts/storage';
  import { fetchReplyThread } from '../ts/chat-actions';
  import Dialog from './common/Dialog.svelte';
  import PaidMessage from './PaidMessage.svelte';
  import MembershipItem from './MembershipItem.svelte';
  import Message from './Message.svelte';

  $: sc = $focusedSuperchat;
  let open = false;
  const openDialog = () => (open = true);
  const closeDialog = () => ($focusedSuperchat = null);
  $: if (sc) openDialog();
  $: if (!open) closeDialog();

  let fetchedReplies: Ytc.ParsedMessage[] = [];
  let replyError: string | null = null;
  let loadingReplies = false;
  let repliesExpanded = false;
  let lastFetchedParams: string | null = null;

  $: replyThreadParams = sc?.replyThreadParams;
  $: likeCountKey = sc?.likeCountEntityKey;
  $: likeCount = likeCountKey ? $liveLikeCounts.get(likeCountKey) : undefined;

  $: fetchedIds = new Set(fetchedReplies.map(r => r.messageId));
  $: replies = [...fetchedReplies, ...$liveReplyBuffer.filter(r => !fetchedIds.has(r.messageId))];

  $: scPaid = sc && (sc.superChat ?? sc.superSticker);
  $: scTintStyle = sc?.superChat
    ? `background-color: #${sc.superChat.headerBackgroundColor}; color: #${sc.superChat.headerTextColor};`
    : sc?.superSticker
      ? `background-color: #${sc.superSticker.bodyBackgroundColor}; color: #${sc.superSticker.bodyTextColor};`
      : '';
  $: borderStyle = scPaid ? `border: 2px solid #${scPaid.bodyBackgroundColor};` : '';

  const setReplyState = (active: boolean, threadId: string | null, params: string | null) => {
    fetchedReplies = [];
    replyError = null;
    $liveReplyBuffer = [];
    loadingReplies = active;
    $activeReplyThreadId = threadId;
    lastFetchedParams = params;
  };

  $: if (open && replyThreadParams && replyThreadParams !== lastFetchedParams) {
    const fetching = replyThreadParams;
    setReplyState(true, sc?.threadId ?? null, fetching);
    fetchReplyThread(fetching, $port)
      .then((r) => {
        if (lastFetchedParams !== fetching) return;
        fetchedReplies = r;
        loadingReplies = false;
      })
      .catch((e) => {
        if (lastFetchedParams !== fetching) return;
        replyError = String(e?.message ?? e);
        loadingReplies = false;
      });
  }

  $: if (!open) {
    setReplyState(false, null, null);
    repliesExpanded = false;
  }

  $: canExpand = !loadingReplies && !replyError && (replies.length > 0 || likeCountKey != null);
  $: if (!canExpand && repliesExpanded) repliesExpanded = false;

  const toggleReplies = () => {
    if (!canExpand) return;
    repliesExpanded = !repliesExpanded;
  };
</script>

<Dialog bind:active={open} noCloseButton expandWidth class="no-padding">
  {#if sc}
  <div
    class="rounded-md overflow-hidden w-full sc-stack bg-white dark:bg-dark-800 text-gray-900 dark:text-white flex flex-col"
    style={borderStyle}
  >
    {#if sc.superChat ?? sc.superSticker}
      <PaidMessage message={sc} />
    {:else}
      <MembershipItem message={sc} />
    {/if}

    {#if replyThreadParams && canExpand}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="flex flex-row items-center reply-bar cursor-pointer"
        style={scTintStyle + ' padding: 2px 8px;'}
        on:click={toggleReplies}
        role="button"
        tabindex="0"
        aria-label={repliesExpanded ? 'Hide replies' : 'Show replies'}
        transition:slide|local={{ duration: 40 }}
      >
        <Icon small>
          {#if repliesExpanded}
            expand_less
          {:else}
            expand_more
          {/if}
        </Icon>
        <span class="ml-1 font-medium tracking-wide text-xs">
          {#if replyError}
            Replies unavailable
          {:else}
            {replies.length === 1 ? '1 reply' : `${replies.length} replies`}
            {#if likeCount != null}
              • {likeCount === 1 ? '1 like' : `${likeCount} likes`}
            {/if}
          {/if}
        </span>
      </div>
      {#if repliesExpanded}
        <div
          class="overflow-y-auto px-2 py-2"
          style="flex: 1 1 auto; min-height: 0;"
          transition:slide|local={{ duration: 200 }}
        >
          {#if loadingReplies}
            <div class="text-xs italic opacity-75 select-none">Loading…</div>
          {:else if replyError}
            <div class="text-xs italic opacity-75 select-none">{replyError}</div>
          {:else if replies.length === 0}
            <div class="text-xs italic opacity-75 select-none">No replies yet.</div>
          {:else}
            <div class="flex flex-col gap-1">
              {#each replies as reply (reply.messageId)}
                <Message message={reply} hideDropdown hideReplyIndicator />
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
  {/if}
</Dialog>

<style>
  :global(.no-padding>div):nth-child(1), :global(.no-padding>div):nth-child(3) {
    display: none;
  }
  :global(.no-padding) {
    padding: 0px !important;
    margin: 3rem 10px auto 10px !important;
    align-self: flex-start !important;
    background-color: transparent !important;
  }
  .sc-stack {
    max-height: calc(99vh - 3rem);
  }
  /* Strip the PaidMessage's own rounding so it merges into the outer rounded box. */
  .sc-stack :global(> :first-child) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
</style>
