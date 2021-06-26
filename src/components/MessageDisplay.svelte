<script>
  import {
    afterUpdate,
    onMount,
    onDestroy,
    createEventDispatcher
  } from 'svelte';
  import Message from './Message.svelte';
  import { Checkbox, Icon } from 'svelte-materialify/src';
  import { sources, combineStores } from '../js/sources.js';
  import Minimizer from './Minimizer.svelte';
  import MessageDisplayWrapper from "./MessageDisplayWrapper.svelte";
  import '../css/splash.css';
  import { mdiEyeOffOutline, mdiAccountRemove } from '@mdi/js';
  import {
    channelFilters,
    livetlFontSize,
    showTimestamp,
    welcomeDismissed,
    textDirection
  } from '../js/store.js';
  import {
    BROWSER,
    Browser,
    AuthorType,
    TextDirection
  } from '../js/constants.js';

  import IntroMessage from './IntroMessage.svelte';

  $: document.body.style.fontSize = Math.round($livetlFontSize) + 'px';
  export let direction;
  /** @type {{ text: String, author: String, timestamp: String }[]}*/
  export let items = [];

  let bottomMsg = null;
  let unsubscribe = null;
  onMount(() => {
    const { cleanUp, store: source } = combineStores(
      sources.translations,
      sources.mod
    );
    const sourceUnsub = source.subscribe(n => {
      if (n) {
        items.push({...n, index: items.length});
      }
      items = items;
    });
    unsubscribe = () => {
      cleanUp();
      sourceUnsub();
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
  
  const version = window.chrome.runtime.getManifest().version;

  export let isSelecting = false;
  export let selectedItems = [];

  const banMessage = item => () => {
    channelFilters.set(item.id, {
      ...channelFilters.get(item.id),
      name: item.author,
      blacklist: true,
    });
    items = items.filter(i => i.id != item.id);
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
        on:hide={() => (item.hidden = true)}
        on:ban={banMessage(item)}
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

  h2 {
    font-size: 1.5em;
    line-height: 1.5em;
  }

  .badges {
    margin-top: 10px;
  }

  .badges img {
    height: 1.5em;
  }

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .subheading {
    font-size: 1em;
  }

  .subscripts {
    font-size: 0.75em;
  }

  .subscripts a {
    color: inherit !important;
  }

  .message-display {
    display: flex;
    width: 100%;
    max-height: 100%;
  }
</style>
