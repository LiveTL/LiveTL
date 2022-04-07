<script lang="ts">
  import { afterUpdate, createEventDispatcher } from 'svelte';
  import Message from './Message.svelte';
  import MessageDisplayWrapper from './MessageDisplayWrapper.svelte';
  import '../css/splash.css';
  import {
    channelFilters,
    livetlFontSize,
    mchadUsers,
    showTimestamp,
    spotlightedTranslator,
    sessionHidden,
    isSelecting,
    isVisible
  } from '../js/store.js';
  import { AuthorType, TextDirection } from '../js/constants.js';
  import IntroMessage from './IntroMessage.svelte';
  import Checkbox from './common/Checkbox.svelte';

  export let direction: TextDirection;
  export let items: Ltl.Message[] = [];
  export let selectedItems: Ltl.Message[] = [];
  export let hideIntro = false;

  let bottomMsg: HTMLElement | undefined;

  export function scrollToRecent(overrideVisibility = false) {
    if (!bottomMsg) {
      console.error('bottomMsg undefined');
      return;
    }

    if (!$isVisible && !overrideVisibility) {
      console.debug('bottom message is not visible, abort scrolling');
      return;
    }

    bottomMsg.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'nearest'
    });
  }

  const dispatch = createEventDispatcher();
  afterUpdate(() => dispatch('afterUpdate'));

  const banMessage = (item: Ltl.Message) => () => {
    if (item.types & AuthorType.mchad) {
      mchadUsers.set(item.author, true);
    } else {
      channelFilters.set(item.authorId, {
        ...channelFilters.get(item.authorId),
        name: item.author,
        blacklist: true
      });
    }
  };

  const hideMessage = (item: Ltl.Message) => () => {
    // TODO: Remove the following comment once stores are TS-ed
    // @ts-expect-error - Store not properly typed yet
    $sessionHidden = [...$sessionHidden, item.messageId];
  };

  $: if (!$isSelecting) selectedItems = [];
  $: classes = `message-display w-full flex max-h-full ${
    direction === TextDirection.TOP
      ? 'self-start flex-col-reverse'
      : 'self-end flex-col'
  }`;
</script>

<MessageDisplayWrapper>
  <div
    class={classes}
    style="font-size: {Math.round($livetlFontSize)}px; word-break: break-word;"
  >
    {#if !hideIntro}
      <IntroMessage />
    {/if}
    {#each items as item}
      <Message
        message={item}
        hidden={item.hidden}
        showTimestamp={$showTimestamp}
        deleted={item.deleted}
        messageArray={item.messageArray}
        on:hide={hideMessage(item)}
        on:ban={banMessage(item)}
        on:spotlight={(e) =>
          spotlightedTranslator.set(
            $spotlightedTranslator ? null : e.detail.authorId
          )}
      >
        {#if $isSelecting}
          <Checkbox
            bind:group={selectedItems}
            value={item}
            wrapperClass="inline-flex"
          />
        {/if}
      </Message>
    {/each}
    <div class="bottom 🥺" bind:this={bottomMsg} />
  </div>
</MessageDisplayWrapper>
