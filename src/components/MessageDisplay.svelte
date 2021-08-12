<script>
  import {
    afterUpdate,
    onMount,
    onDestroy,
    createEventDispatcher
  } from 'svelte';
  import Message from './Message.svelte';
  import { Checkbox } from 'svelte-materialify/src';
  import { sources, combineStores } from '../js/sources.js';
  import { removeDuplicateMessages } from '../js/sources-util.js';
  import MessageDisplayWrapper from './MessageDisplayWrapper.svelte';
  import '../css/splash.css';
  import {
    channelFilters,
    livetlFontSize,
    mchadUsers,
    showTimestamp,
    spotlightedTranslator,
    ytcDeleteBehaviour
  } from '../js/store.js';
  import {
    AuthorType,
    TextDirection,
    YtcDeleteBehaviour
  } from '../js/constants.js';
  import IntroMessage from './IntroMessage.svelte';
  // eslint-disable-next-line no-unused-vars
  import { MessageItem } from '../js/types.js';

  $: document.body.style.fontSize = Math.round($livetlFontSize) + 'px';
  export let direction;
  /** @type {{ text: String, author: String, timestamp: String, authorId: string, messageId: string, hidden: boolean, messageArray: MessageItem[], deleted: boolean }[]}*/
  export let items = [];

  let bottomMsg = null;
  let unsubscribe = null;
  onMount(() => {
    const { cleanUp, store: sourceWithDups } = combineStores(
      sources.translations,
      sources.mod,
    );
    const source = removeDuplicateMessages(sourceWithDups);
    const sourceUnsub = source.subscribe(n => {
      if (n) {
        items.push({...n, index: items.length});
      }
      items = items;
    });
    const hideOrReplace = (i, bonkOrDeletion) => {
      if ($ytcDeleteBehaviour === YtcDeleteBehaviour.HIDE) {
        items[i].hidden = true;
      } else if ($ytcDeleteBehaviour === YtcDeleteBehaviour.PLACEHOLDER) {
        items[i].messageArray = bonkOrDeletion.replacedMessage;
        items[i].deleted = true;
      }
    };
    const bonkUnsub = sources.ytcBonks.subscribe(bonks => {
      if (!bonks || bonks.length < 1) return;

      for (let i = items.length - 1; i >= 0; --i) {
        bonks.some(bonk => {
          if (items[i].authorId !== bonk.authorId) return false;
          hideOrReplace(i, bonk);
          return true;
        });
      }
    });
    const deletetionUnsub = sources.ytcDeletions.subscribe(deletions => {
      if (!deletions || deletions.length < 1) return;
      console.debug($ytcDeleteBehaviour);

      for (let i = items.length - 1; i >= 0; --i) {
        deletions.some(deletion => {
          if (items[i].messageId !== deletion.messageId) return false;
          hideOrReplace(i, deletion);
          return true;
        });
      }

    });
    unsubscribe = () => {
      cleanUp();
      sourceUnsub();
      bonkUnsub();
      deletetionUnsub();
    };
  });
  onDestroy(() => unsubscribe());

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
    items = items.filter(i => i.authorId != item.authorId);
  };

  $: if (!isSelecting) selectedItems = [];
  $: if ($spotlightedTranslator) {
    items = items.filter(msg => msg.authorId === $spotlightedTranslator);
  }
  $: console.log(items);
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
        on:hide={() => (item.hidden = true)}
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
