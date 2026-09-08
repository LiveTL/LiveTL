<script lang="ts">
  import {
    theme,
    showOnlyMemberChat,
    showProfileIcons,
    showTimestamps,
    showUsernames,
    showUserBadges,
    emojiRenderMode,
    emojiScale,
    autoLiveChat,
    useSystemEmojis,
    isDark,
    enableStickySuperchatBar,
    enableHighlightedMentions,
    showChatSummary,
    showSuperchatReplyIndicators
  } from '../../ts/storage';
  import { themeItems, emojiRenderItems } from '../../ts/chat-constants';
  import Card from '../common/Card.svelte';
  import Radio from '../common/RadioGroupStore.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import Icon from '@livetl/ui/Icon';
  import dark from 'smelte/src/dark';
  import MessageTranslationSettings from './MessageTranslationSettings.svelte';

  const willChangeOnNextChunkMessage = (
    'Settings listed below will take effect when the next chat message chunk arrives.'
  );

  const darkStore = dark();
  $: darkStore.set($isDark);

  $: console.debug({
    theme: $theme,
    showProfileIcons: $showProfileIcons,
    showTimestamps: $showTimestamps,
    showUsernames: $showUsernames
  });

  const superchatBarWasDisabled = !$enableStickySuperchatBar;
  let superchatBarWasToggled: boolean | null = null;
  const updateSuperchatBarToggle = () => {
    superchatBarWasToggled = superchatBarWasToggled !== null;
  };
  $: $enableStickySuperchatBar, updateSuperchatBarToggle();
</script>

<Card title="Appearance" icon="format_paint">
  <div class="flex items-center gap-2">
    <h6>Theme:</h6>
    <Radio store={theme} items={themeItems} />
  </div>
  <Checkbox name="Enable sticky superchat bar" store={enableStickySuperchatBar} />
  {#if (superchatBarWasToggled ?? superchatBarWasDisabled) && $enableStickySuperchatBar}
    <i>The superchat bar will appear upon reload or when the next superchat arrives.</i>
  {/if}
</Card>

<Card title="Messages" icon="message">
  <Checkbox name="Show profile icons" store={showProfileIcons} />
  <Checkbox name="Show timestamps" store={showTimestamps} />
  <Checkbox name="Show usernames" store={showUsernames} />
  <Checkbox name="Show user badges" store={showUserBadges} />
  <Checkbox name="Show experimental chat summaries by YouTube" store={showChatSummary} />
  <Checkbox name="Highlight mentions" store={enableHighlightedMentions} />
  <Checkbox name="Show superchat reply indicator" store={showSuperchatReplyIndicators} />
</Card>

<Card title="Emojis" icon="emoji_emotions">
  <div class="flex items-center justify-between gap-2">
    <label for="emoji-scale">Emoji size: {Math.round($emojiScale * 100)}%</label>
    <button
      type="button"
      class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-400"
      title="Reset emoji size"
      aria-label="Reset emoji size"
      on:click={() => { $emojiScale = 1; }}
    >
      <Icon small>restore</Icon>
    </button>
  </div>
  <input
    id="emoji-scale"
    type="range"
    min="0.5"
    max="2"
    step="0.05"
    bind:value={$emojiScale}
    aria-valuetext="{Math.round($emojiScale * 100)}%"
    class="w-full rounded cursor-pointer bg-primary-200 my-2"
    style="--bg: var(--color-primary-500); --bg-focus: var(--color-primary-500)"
  />
  <Checkbox name="Use system emojis when possible" store={useSystemEmojis} />
  <i>{willChangeOnNextChunkMessage}</i>
  <Radio store={emojiRenderMode} items={emojiRenderItems} vertical />
</Card>

<Card title="Filters" icon="filter_list">
  <i>{willChangeOnNextChunkMessage}</i>
  <Checkbox name="Show only member chat messages" store={showOnlyMemberChat} />
</Card>

<Card title="Additional Options" icon="tune">
  <a
    href="https://myaccount.google.com/blocklist"
    class="ml-2 dark:text-primary-50 text-primary-900"
    target="_blank"
  >
    <span class="underline">Unblock chat users</span>
    <Icon class="inline align-middle" small>open_in_new</Icon>
  </a>
  <Checkbox name="Automatically switch to Live Chat" store={autoLiveChat} />
  <MessageTranslationSettings />
</Card>
