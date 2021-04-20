<script>
  import { beforeUpdate, afterUpdate, onMount, onDestroy } from 'svelte';
  import { TextDirection } from '../js/constants.js';
  import { sources, combineStores } from '../js/sources.js';
  import '../css/splash.css';
  import { Icon } from 'svelte-materialify/src';
  import { mdiPencil, mdiEyeOffOutline } from '@mdi/js';
  import { channelFilters, livetlFontSize } from '../js/store.js';
  $: document.body.style.fontSize = Math.round($livetlFontSize) + 'px';
  export let direction;
  export let settingsOpen = false;
  /** @type {{ text: String, author: String }[]}*/
  export let items = [];
  export let updatePopupActive = false;

  let bottomMsg = null;
  let messageDisplay = null;
  let unsubscribe = null;
  const shouldScroll = () => {
    try {
      const parentElem =
        messageDisplay.parentElement.parentElement.parentElement;
      return (
        bottomMsg &&
        Math.ceil(parentElem.clientHeight + parentElem.scrollTop) >=
          parentElem.scrollHeight
      );
    } catch (e) {
      return false;
    }
  };
  onMount(() => {
    const { cleanUp, store: source } = combineStores(
      sources.translations,
      sources.mod
    );
    const sourceUnsub = source.subscribe(n => {
      if (n) items.push(n);
      items = items;
    });
    unsubscribe = () => {
      cleanUp();
      sourceUnsub();
    };
  });
  onDestroy(() => unsubscribe());

  let scrollOnTick = false;
  let settingsWasOpen = false;
  $: settingsWasOpen = !settingsOpen;
  beforeUpdate(() => {
    if (
      (shouldScroll() || settingsWasOpen) &&
      direction == TextDirection.BOTTOM
    ) {
      scrollOnTick = true;
      settingsWasOpen = false;
    }
  });
  afterUpdate(() => {
    if (scrollOnTick) bottomMsg.scrollIntoView();
    scrollOnTick = false;
  });
</script>

<div class="messageDisplayWrapper">
  <div
    bind:this={messageDisplay}
    class="messageDisplay"
    style="align-self: flex-{direction === TextDirection.BOTTOM
      ? 'end'
      : 'start'};
      flex-direction: column{direction === TextDirection.TOP
      ? '-reverse'
      : ''};"
  >
    <div class="message">
      <div class="heading">
        <strong> Welcome to LiveTL! </strong>
      </div>
      <div class="subheading">
        Translations picked up from the chat will appear here.
      </div>
      <div class="subscripts">
        <!-- svelte-ignore missing-declaration -->
        <a
          href="/"
          on:click={e => {
            e.preventDefault();
            // eslint-disable-next-line no-unused-vars
            updatePopupActive = true;
          }}
          >See what's new in the most recent update ({window.chrome.runtime.getManifest()
            .version})</a
        >
      </div>
      <div class="subscripts">
        Please consider
        <a
          id="shareExtension"
          href="https://livetl.github.io/LiveTL"
          target="about:blank">sharing LiveTL with your friends</a
        >,
        <a
          href="https://livetl.github.io/LiveTL/about/review"
          target="about:blank">giving us a 5-star review</a
        >,
        <a href="https://discord.gg/uJrV3tmthg" target="about:blank"
          >joining our Discord server</a
        >,
        <a href="https://github.com/LiveTL/LiveTL" target="about:blank"
          >starring our GitHub repository</a
        >, and
        <a href="https://opencollective.com/livetl" target="about:blank"
          >chipping in a few dollars to help fund future projects (stay tuned)</a
        >!
        <div class="badges">
          <a href="https://discord.gg/uJrV3tmthg" target="about:blank">
            <img
              alt="Discord"
              src="https://img.shields.io/discord/780938154437640232.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2&style=flat"
            />
          </a>
          <a
            href="https://chrome.google.com/webstore/detail/livetl-translation-filter/moicohcfhhbmmngneghfjfjpdobmmnlg"
            target="about:blank"
          >
            <img
              alt="Chrome Web Store"
              src="https://img.shields.io/chrome-web-store/users/moicohcfhhbmmngneghfjfjpdobmmnlg?color=blue&label=Chrome%20Users&logo=google&logoColor=white&style=flat"
            />
          </a>
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/livetl/"
            target="about:blank"
          >
            <img
              alt="Mozilla Addons"
              src="https://img.shields.io/amo/users/livetl?color=blue&label=Firefox%20Users&logo=mozilla&logoColor=white&style=flat"
            />
          </a>
          <a
            href="https://livetl.app/"
            target="about:blank"
          >
            <img
              alt="Other Platforms"
              src="https://img.shields.io/badge/Other%20Platforms-Android%2C%20iOS-blue?style=flat"
            />
          </a>
          <a
            href="https://livetl.github.io/LiveTL/about/review"
            target="about:blank"
          >
            <img
              alt="Reviews"
              src="https://img.shields.io/badge/Average%20Rating-5%20stars-blue?style=flat"
            />
          </a>
          <a href="https://github.com/LiveTL/LiveTL/" target="about:blank">
            <img
              alt="GitHub Repo"
              src="https://img.shields.io/github/stars/LiveTL/LiveTL?style=flat&logo=github&label=Stars"
            />
          </a>
          <a href="https://livetl.app/" target="about:blank">
            <img
              alt="Website"
              src="https://img.shields.io/website?down_color=red&down_message=offline&label=Website&up_color=blue&up_message=livetl.app&url=http%3A%2F%2Flivetl.app%2F&style=flat"
            />
          </a>
          <a href="https://opencollective.com/livetl" target="about:blank">
            <img
              alt="Donators and Supporters"
              src="https://img.shields.io/opencollective/all/livetl?color=blue&label=Donators%20and%20Supporters&logo=dollar&style=flat"
            />
          </a>
          <a
            href="https://hosted.weblate.org/engage/livetl/"
            target="about:blank"
          >
            <img
              alt="Localization"
              src="https://img.shields.io/badge/Localization-Weblate-blue"
            />
          </a>
        </div>
      </div>
    </div>
    {#each items as item}
      <div class="message" let:hovering>
        <span>{item.text}</span>
        <span class="author"
          >{item.author}
          <span class="messageActions">
            <span class="blueHighlight">
              <Icon path={mdiPencil} size="1em" class="blueHighlight" />
            </span>
            <span
              class="redHighlight"
              on:click={() => {
                channelFilters.set(item.id, {
                  ...channelFilters.get(item.id),
                  name: item.author,
                  blacklist: true
                });
                items = items.filter(i => i.id != item.id);
              }}
            >
              <Icon path={mdiEyeOffOutline} size="1em" />
            </span>
          </span>
        </span>
      </div>
    {/each}
    <div class="bottom 🥺" bind:this={bottomMsg} />
  </div>
</div>

<style>
  .badges {
    margin-top: 10px;
  }
  .badges img {
    height: 1.5em;
  }
  .heading {
    font-size: 1.5em;
  }
  .subheading {
    font-size: 1em;
  }
  .subscripts {
    font-size: 0.75em;
  }
  .subscripts > a {
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
    max-height: 100%;
    width: 100%;
  }

  .message {
    --margin: 5px;
    margin: var(--margin);
    padding: calc(1.5 * var(--margin));
    width: calc(100% - 2 * var(--margin));
    animation: splash 1s normal forwards ease-in-out;
    border-radius: var(--margin);
  }

  .messageActions {
    display: none;
  }

  .messageActions .blueHighlight :global(.s-icon:hover) {
    color: var(--theme-text-link);
  }
  .messageActions .redHighlight :global(.s-icon:hover) {
    color: #ff2873;
  }

  .message:hover .messageActions {
    display: inline-block !important;
    cursor: pointer;
  }
  .author {
    font-size: 0.75em;
    color: lightgray;
  }

  .message:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.075);
  }
  .message:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
