<script lang="ts">
  import Message from './Message.svelte';
  import isDarkColor from 'is-dark-color';
  import { Theme } from '../ts/chat-constants';
  import type { Chat } from '../ts/typings/chat';

  export let message: Ytc.ParsedMessage;
  export let deleted: Chat.MessageDeletedObj | null = null;

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

  const classes = 'inline-flex flex-col rounded break-words overflow-visible w-full';

  $: if (!paid) {
    console.error('Not a paid message', { message });
  }
  const darkEval = () => {
    if (!('superChat' in message)) return undefined;
    return isDarkColor(`#${message.superChat?.headerTextColor}`) ? Theme.LIGHT : Theme.DARK;
  };
</script>

{#if paid}
  <div>
    <Message message={message} {deleted} forceTLColor={darkEval()} on:clientSideDelete>
      <span class="{classes} chip" style={backgroundColor + textColor} slot="chip">
        <span class="p-1" style={headerStyle}>
          <span class="underline font-bold">{amount}</span>
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
