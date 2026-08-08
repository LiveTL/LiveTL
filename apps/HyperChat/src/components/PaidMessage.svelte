<script lang="ts">
  import Message from './Message.svelte';
  import isDarkColor from 'is-dark-color';
  import { Theme } from '../ts/chat-constants';
  import { formatAuthorName } from '../ts/component-utils';
  import { showProfileIcons, showTimestamps } from '../ts/storage';

  export let message: Ytc.ParsedMessage;

  let headerStyle = '';

  $: paid = message.superChat ?? message.superSticker;
  $: amount = paid?.amount;
  $: backgroundColor = `background-color: #${paid?.bodyBackgroundColor};`;
  $: textColor = `color: #${paid?.bodyTextColor};`;
  $: nameColor = `color: #${paid?.nameColor};`;
  $: if (message.superChat) {
    const background = message.superChat.headerBackgroundColor;
    const text = message.superChat.headerTextColor;
    headerStyle = `background-color: #${background}; color: #${text};`;
  } else {
    headerStyle = '';
  }

  const classes = 'inline-flex flex-col rounded break-words w-full';
  $: hasBody = message.message.length > 0 || !!message.superSticker;
  $: displayAuthorName = formatAuthorName(message.author.name);

  $: if (!paid) {
    console.error('Not a paid message', { message });
  }
  const darkEval = () => {
    if (!('superChat' in message)) return undefined;
    return isDarkColor(`#${message.superChat?.headerTextColor}`) ? Theme.LIGHT : Theme.DARK;
  };
</script>

{#if paid}
  <div class={classes} style={backgroundColor + textColor}>
    <div class="p-2 {hasBody ? 'rounded-t' : 'rounded'}" style={headerStyle}>
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
      <span class="font-bold tracking-wide align-middle" style={nameColor}>
        {displayAuthorName}
      </span>
      <span class="float-right underline font-bold align-middle ml-2">{amount}</span>
    </div>
    {#if message.superSticker}
      <div class="p-2">
        <img
          class="h-full w-auto max-h-20"
          src={message.superSticker.src}
          alt={message.superSticker.alt}
          title={message.superSticker.alt} />
      </div>
    {/if}
    {#if message.message.length > 0}
      <div class="p-2">
        <Message message={message} hideName forceTLColor={darkEval()} />
      </div>
    {/if}
  </div>
{/if}
