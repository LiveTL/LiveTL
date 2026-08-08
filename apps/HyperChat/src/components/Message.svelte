<script lang="ts">
  import MessageRun from './MessageRuns.svelte';
  import Icon from './common/Icon.svelte';
  import Menu from './common/Menu.svelte';
  import {
    showProfileIcons,
    showUsernames,
    showTimestamps,
    showUserBadges,
    hoveredItem,
    port,
    selfChannelId,
    showSuperchatReplyIndicators,
    stickySuperchats,
    focusedSuperchat
  } from '../ts/storage';
  import { chatUserActionsItems, ChatUserActions, Theme } from '../ts/chat-constants';
  import { useBanHammer } from '../ts/chat-actions';
  import type { Chat } from '../ts/typings/chat';
  import { formatAuthorName } from '../ts/component-utils';
  import { mdiGift, mdiReply } from '@mdi/js';

  export let message: Ytc.ParsedMessage;
  export let deleted: Chat.MessageDeletedObj | null = null;
  export let forceDark = false;
  export let hideName = false;
  export let hideDropdown = false;
  export let hideReplyIndicator = false;

  const nameClass = 'font-bold tracking-wide align-middle';
  const generateNameColorClass = (member: boolean, moderator: boolean, owner: boolean, forceDark: boolean) => {
    if (owner && forceDark) {
      return 'text-owner-dark';
    } else if (owner) {
      return 'text-owner-light dark:text-owner-dark';
    } else if (moderator && forceDark) {
      return 'text-moderator-dark';
    } else if (moderator) {
      return 'text-moderator-light dark:text-moderator-dark';
    } else if (member && forceDark) {
      return 'text-member-dark';
    } else if (member) {
      return 'text-member-light dark:text-member-dark';
    } else if (forceDark) {
      return 'text-gray-500';
    } else {
      return 'text-gray-700 dark:text-gray-500';
    }
  };

  let member = false;
  let verified = false;
  let moderator = false;
  let owner = false;
  $: message.author.types.forEach((type) => {
    if (type === 'member') member = true;
    else if (type === 'verified') verified = true;
    else if (type === 'moderator') moderator = true;
    else if (type === 'owner') owner = true;
  });
  $: nameColorClass = generateNameColorClass(member, moderator, owner, forceDark);

  let showOriginal = false;
  $: displayRuns = deleted != null && !showOriginal ? deleted.replace : message.message;
  // If showing original text, swap the first text run to 'hide'.
  let toggleLabelRuns: Ytc.ParsedRun[] | undefined;
  $: {
    let swapped = !showOriginal;
    toggleLabelRuns = deleted?.viewOriginalText?.map((r) => {
      if (swapped || r.type !== 'text') return r;
      swapped = true;
      return { ...r, text: 'Hide deleted message' };
    });
  }
  $: displayAuthorName = formatAuthorName(message.author.name);

  $: showUserMargin = $showProfileIcons || $showUsernames || $showTimestamps ||
    ($showUserBadges && (moderator || verified || member));

  export let forceTLColor: Theme = Theme.YOUTUBE;

  $: isSelf = message.author.id === $selfChannelId;
  $: visibleActions = chatUserActionsItems.filter((d) => {
    if (d.value === ChatUserActions.DELETE_MESSAGE) {
      return (isSelf || message.canDelete) && message.params != null && deleted == null;
    }
    return !isSelf;
  });
  $: menuItems = visibleActions.map((d) => ({
    icon: d.icon,
    text: d.text,
    value: d.value.toString(),
    onClick: () => { useBanHammer(message, d.value, $port); }
  }));

  const openReplyTargetSuperchat = () => {
    const threadId = message.replyToSuperchat?.threadId;
    const match = threadId ? $stickySuperchats.find((s) => s.threadId === threadId) : undefined;
    if (!threadId || !match) return;
    $focusedSuperchat = match;
  };
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
  class="inline-flex flex-row gap-2 break-words w-full overflow-visible"
>
  {#if !hideName && $showProfileIcons}
    <a
      href={message.author.url}
      class="flex-shrink-0 {message.author.url ? 'cursor-pointer' : 'cursor-auto'} {deleted != null ? 'opacity-50' : ''}"
      target="_blank"
    >
      <img
        class="h-5 w-5 inline align-middle rounded-full flex-none"
        src={message.author.profileIcon.src}
        alt={message.author.profileIcon.alt}
      />
    </a>
  {/if}
  <div class={deleted != null ? 'opacity-50' : ''}>
    {#if !hideName}
      <span
        class="text-xs mr-1 text-gray-700 dark:text-gray-600 align-middle"
        class:hidden={!$showTimestamps}
      >
        {message.timestamp}
      </span>
      <a
        href={message.author.url}
        class:cursor-pointer={message.author.url}
        class:cursor-auto={!message.author.url}
        target="_blank"
      >
        <span
          class="{nameClass} {nameColorClass}"
          class:hidden={!$showUsernames}
        >
          {displayAuthorName}
        </span>
      </a>
      <span class="align-middle" class:hidden={!$showUserBadges}>
        {#if moderator}
          <Icon class="inline align-middle" small>build</Icon>
        {/if}
        {#if verified}
          <Icon
            class="inline align-middle text-gray-500"
            small
          >
            verified
          </Icon>
        {/if}
        {#if member && message.author.customBadge}
          <img
            class="h-4 w-4 inline align-middle"
            src={message.author.customBadge.src}
            alt={message.author.customBadge.alt}
            title={message.author.customBadge.alt}
          />
        {/if}
      </span>
      <span class="mr-1.5" class:hidden={!showUserMargin} />
    {/if}
    {#if message.replyToSuperchat && $showSuperchatReplyIndicators && !hideReplyIndicator}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span
        class="inline-flex items-center justify-center align-middle cursor-pointer rounded"
        style={
          'width: 1.6em; height: 1.6em;' +
          (message.replyToSuperchat.bgColor ? ` background-color: #${message.replyToSuperchat.bgColor};` : '') +
          (message.replyToSuperchat.fgColor ? ` color: #${message.replyToSuperchat.fgColor};` : ' color: inherit;')
        }
        role="button"
        tabindex="0"
        aria-label={`Open Super Chat by ${message.replyToSuperchat.authorName}`}
        title={`Open Super Chat by ${message.replyToSuperchat.authorName}`}
        on:click|stopPropagation={openReplyTargetSuperchat}
      >
        <svg
          height="1.2em"
          width="1.2em"
          viewBox="0 0 24 24"
        >
          <path d={mdiReply} fill="currentColor"/>
        </svg>
      </span>
    {/if}
    <MessageRun
      runs={displayRuns}
      {forceDark}
      deleted={deleted != null}
      {forceTLColor}
      class="{message.membershipGiftRedeem ? 'text-gray-700 dark:text-gray-600 italic font-medium' : ''} {deleted?.pending || showOriginal ? 'line-through' : ''}"
    />
    {#if deleted?.viewOriginalText}
      <button
        type="button"
        on:click={() => (showOriginal = !showOriginal)}
        class="ml-1 align-middle text-xs cursor-pointer text-deleted-light dark:text-deleted-dark bg-transparent border-0 p-0"
      >
        <MessageRun
          runs={toggleLabelRuns}
          {forceDark}
          {forceTLColor}
          class="underline cursor-pointer"
        />
      </button>
    {/if}
    {#if message.membershipGiftRedeem}
      <svg
        height="1em"
        width="1em"
        viewBox="0 0 24 24"
        class="inline align-middle ml-1 text-gray-700 dark:text-gray-600"
        style="transform: translateY(-1px);"
      >
        <path d={mdiGift} fill="currentColor"/>
      </svg>
    {/if}
  </div>
  {#if menuItems.length > 0 && !hideDropdown}
    <Menu items={menuItems} visible={$hoveredItem === message.messageId} class="mr-2 ml-auto context-menu">
      <Icon slot="activator" style="font-size: 1.5em;">more_vert</Icon>
    </Menu>
  {/if}
</div>
