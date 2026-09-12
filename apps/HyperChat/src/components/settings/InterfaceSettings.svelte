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

  let emojiSize: number | undefined;
  let editingEmojiSize = false;
  $: if (!editingEmojiSize) emojiSize = Math.round($emojiScale * 100);
  const setEmojiSize = (value: number | undefined) => {
    const size = value !== undefined && Number.isFinite(value) ? value : $emojiScale * 100;
    $emojiScale = Math.max(50, Math.min(200, Math.round(size))) / 100;
    emojiSize = Math.round($emojiScale * 100);
  };
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
  <div class="flex flex-wrap items-center justify-between gap-2">
    <label for="emoji-size">Emoji size</label>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-400 disabled:opacity-50"
        title="Decrease emoji size"
        aria-label="Decrease emoji size"
        disabled={$emojiScale <= 0.5}
        on:click={() => setEmojiSize(Math.round($emojiScale * 100) - 5)}
      >
        <Icon small>remove</Icon>
      </button>
      <input
        id="emoji-size"
        type="number"
        min="50"
        max="200"
        step="1"
        bind:value={emojiSize}
        on:focus={() => { editingEmojiSize = true; }}
        on:blur={() => { editingEmojiSize = false; }}
        on:input={(e) => {
          if (e.currentTarget.validity.valid && Number.isFinite(e.currentTarget.valueAsNumber)) {
            setEmojiSize(e.currentTarget.valueAsNumber);
          }
        }}
        on:change={() => setEmojiSize(emojiSize)}
        class="w-16 h-8 px-2 rounded border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-500 text-right"
      />
      <span>%</span>
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-400 disabled:opacity-50"
        title="Increase emoji size"
        aria-label="Increase emoji size"
        disabled={$emojiScale >= 2}
        on:click={() => setEmojiSize(Math.round($emojiScale * 100) + 5)}
      >
        <Icon small>add</Icon>
      </button>
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-400"
        title="Reset emoji size"
        aria-label="Reset emoji size"
        on:click={() => setEmojiSize(100)}
      >
        <Icon small>restore</Icon>
      </button>
    </div>
  </div>
  <input
    id="emoji-scale"
    type="range"
    min="0.5"
    max="2"
    step="0.01"
    bind:value={$emojiScale}
    aria-label="Emoji size"
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
