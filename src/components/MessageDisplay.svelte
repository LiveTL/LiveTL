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
        n.index = items.length;
        items.push(n);
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

  export let screenshotting = false;
  export let selectedItems = [];

  const banMessage = item => () => {
    channelFilters.set(item.id, {
      ...channelFilters.get(item.id),
      name: item.author,
      blacklist: true,
    });
    items = items.filter(i => i.id != item.id);
  };

  $: if (!screenshotting) selectedItems = [];
</script>

<div class="messageDisplayWrapper">
  <div
    class="messageDisplay"
    style="align-self: flex-{direction === TextDirection.BOTTOM
      ? 'end'
      : 'start'};
      flex-direction: column{direction === TextDirection.TOP
      ? '-reverse'
      : ''};"
  >

    <IntroMessage />

    {#each items.filter(item => item) as item}
      <Message
        message={item}
        hidden={item.hidden}
        showTimestamp={$showTimestamp}
        on:hide={() => item.hidden = true}
        on:ban={banMessage(item)}
      >
        {#if screenshotting}
          <Checkbox bind:group={selectedItems} value={item} />
        {/if}
      </Message>
    {/each}
    <div class="bottom 🥺" bind:this={bottomMsg} />
  </div>
</div>

<style>
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
  .messageDisplayWrapper {
    height: 100%;
    width: 100%;
    display: flex;
    overflow-x: hidden;
  }

  .messageDisplay {
    display: flex;
    width: 100%;
    max-height: 100%;
  }

  .message {
    --margin: 5px;
    margin: var(--margin);
    padding: calc(1.5 * var(--margin));
    width: calc(100% - 2 * var(--margin));
    animation: splash 1s normal forwards ease-in-out;
    border-radius: var(--margin);
  }

  .messageDisplayWrapper :global(.message:nth-child(odd)) {
    background-color: rgba(255, 255, 255, 0.075);
  }

  .messageDisplayWrapper :global(.message:nth-child(even)) {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
