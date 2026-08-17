<script lang="ts">
  import { Theme, YoutubeEmojiRenderMode } from '../ts/chat-constants';

  import TranslatedMessage from './TranslatedMessage.svelte';
  import {
    emojiRenderMode, useSystemEmojis
  } from '../ts/storage';
  import { textIsObsoleteMemberEmoji } from '../ts/chat-utils';

  export let runs: Ytc.ParsedRun[] | null;
  export let forceDark = false;
  export let deleted = false;
  export let forceTLColor: Theme = Theme.YOUTUBE;

  let deletedClass = '';

  $: if (deleted && forceDark) {
    deletedClass = 'text-deleted-dark italic';
  } else if (deleted) {
    deletedClass = 'text-deleted-light dark:text-deleted-dark italic';
  } else if (!deleted) {
    deletedClass = '';
  }
</script>

<!--
  The `runs` prop is supposed to always be an array,
  but somewhere, somehow, sometimes, YouTube forgets
  to provide us an array.
  
  This is sorta cheap, but the easiest solution is
  to safeguard a null prop value with a simple check.

  If anyone wants to find a more elegant solution,
  see this bug report:
  https://discord.com/channels/780938154437640232/788107573755904070/983867679968477215
-->
{#if runs?.length}
  <span
    class="cursor-auto align-middle {deletedClass} {$$props.class ?? ''}"
    style="word-break: break-word"
  >
    {#each runs as run}
      {#if run.type === 'text'}
        {#if $emojiRenderMode === YoutubeEmojiRenderMode.HIDE_ALL && textIsObsoleteMemberEmoji(String(run.text))}
          <!-- Hide legacy member emoji placeholders (U+25A1) in hide-all mode. -->
        {:else}
          {#if deleted}
            <span>{run.text}</span>
          {:else}
            {#if run.styles?.includes('bold')}
              <strong>
                <TranslatedMessage text={run.text} {forceTLColor} />
              </strong>
            {:else}
              <TranslatedMessage text={run.text} {forceTLColor} />
            {/if}
          {/if}
        {/if}
      {:else if run.type === 'link'}
        <a
          class="inline underline align-middle"
          href={run.url}
          target="_blank"
        >
          {run.text}
        </a>
      {:else if run.type === 'emoji' && $emojiRenderMode !== YoutubeEmojiRenderMode.HIDE_ALL}
        {#if run.standardEmoji && $useSystemEmojis}
          <span
            class="cursor-auto align-middle text-base"
          >
            {run.alt}
          </span>
        {:else if run.src}
          <img
            class="h-5 w-5 inline mx-0.5 align-middle"
            src={run.src}
            alt={run.alt}
            title={run.alt}
          />
        {/if}
      {/if}
    {/each}
  </span>
{/if}
