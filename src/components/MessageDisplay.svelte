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
    sessionHidden
  } from '../js/store.js';
  import {
    AuthorType,
    TextDirection
  } from '../js/constants.js';
  import IntroMessage from './IntroMessage.svelte';
  import Checkbox from './common/Checkbox.svelte';

  export let direction: TextDirection;
  export let items: Ltl.Message[] = [];
  export let isSelecting = false;
  export let selectedItems: Ltl.Message[] = [];
  export let hideIntro = false;

  let bottomMsg: HTMLElement | undefined;

  export function scrollToRecent () {
    if (!bottomMsg) {
      console.error('bottomMsg undefined');
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

  $: document.body.style.fontSize = Math.round($livetlFontSize) + 'px';
  $: if (!isSelecting) selectedItems = [];
  $: classes = `w-full flex max-h-full ${direction === TextDirection.TOP ? 'self-start flex-col-reverse' : 'self-end flex-col'}`;
</script>

<MessageDisplayWrapper>
  <div class={classes}>
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
        on:spotlight={e => spotlightedTranslator.set(
          $spotlightedTranslator ? null : e.detail.authorId
        )}
        {isSelecting}
      >
        {#if isSelecting}
          <Checkbox bind:group={selectedItems} value={item} wrapperClass="inline-flex" />
        {/if}
      </Message>
    {/each}
    <div class="bottom 🥺" bind:this={bottomMsg} />
  </div>
</MessageDisplayWrapper>
