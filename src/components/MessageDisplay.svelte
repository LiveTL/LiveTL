<script>
  import {
    afterUpdate,
    onMount,
    onDestroy,
    createEventDispatcher
  } from 'svelte';
  import Message from './Message.svelte';
  import { Checkbox } from 'svelte-materialify/src';
  import { removeDuplicateMessages } from '../js/sources-util.js';
  import MessageDisplayWrapper from './MessageDisplayWrapper.svelte';
  import '../css/splash.css';
  import {
    channelFilters,
    livetlFontSize,
    mchadUsers,
    showTimestamp,
    spotlightedTranslator
  } from '../js/store.js';
  import {
    AuthorType,
    TextDirection
  } from '../js/constants.js';
  import IntroMessage from './IntroMessage.svelte';
  // eslint-disable-next-line no-unused-vars
  import { MessageItem } from '../js/types.js';

  $: document.body.style.fontSize = Math.round($livetlFontSize) + 'px';
  export let direction;
  /** @type {{ text: String, author: String, timestamp: String, authorId: string, messageId: string, hidden: boolean, messageArray: MessageItem[], deleted: boolean }[]}*/
  export let items = [];

  let bottomMsg = null;

  export function scrollToRecent() {
    bottomMsg.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'nearest'
    });
  }

  const dispatch = createEventDispatcher();
  afterUpdate(() => dispatch('afterUpdate'));
  
  export let isSelecting = false;
  export let selectedItems = [];

  const banMessage = item => () => {
    if (item.types & AuthorType.mchad) {
      mchadUsers.set(item.author, true);
    } else {
      channelFilters.set(item.authorId, {
        ...channelFilters.get(item.authorId),
        name: item.author,
        blacklist: true,
      });
    }
  };

  const hideMessage = item => () => {
    $sessionHidden = [...$sessionHidden, item.messageId];
  };

  $: if (!isSelecting) selectedItems = [];
</script>

<MessageDisplayWrapper>
  <div
    class="message-display"
    class:dir-top={direction === TextDirection.TOP}
    class:dir-bottom={direction === TextDirection.BOTTOM}
  >
    <IntroMessage />

    {#each items as item}
      <Message
        message={item}
        hidden={item.hidden}
        showTimestamp={$showTimestamp}
        deleted={item.deleted}
        messageArray={item.messageArray}
        on:hide={hideMessage(item)}
        on:ban={banMessage(item)}
        on:spotlight={e => spotlightedTranslator.set(
          $spotlightedTranslator ? null : e.detail.authorId
        )}
      >
        {#if isSelecting}
          <Checkbox bind:group={selectedItems} value={item} />
        {/if}
      </Message>
    {/each}
    <div class="bottom 🥺" bind:this={bottomMsg} />
  </div>
</MessageDisplayWrapper>

<style>
  .dir-top {
    align-self: flex-start;
    flex-direction: column-reverse;
  }

  .dir-bottom {
    align-self: flex-end;
    flex-direction: column;
  }

  .message-display {
    display: flex;
    width: 100%;
    max-height: 100%;
  }
</style>
