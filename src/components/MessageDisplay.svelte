<script>
  import {
    afterUpdate,
    onMount,
    onDestroy,
    createEventDispatcher
  } from 'svelte';
  import { Checkbox, Button } from 'svelte-materialify/src';
  import { sources, combineStores } from '../js/sources.js';
  import '../css/splash.css';
  import { Icon } from 'svelte-materialify/src';
  import { mdiEyeOffOutline, mdiAccountRemove, mdiClose } from '@mdi/js';
  import {
    channelFilters,
    livetlFontSize,
    showTimestamp
  } from '../js/store.js';
  import {
    BROWSER,
    Browser,
    AuthorType,
    TextDirection
  } from '../js/constants.js';

  $: document.body.style.fontSize = Math.round($livetlFontSize) + 'px';
  export let direction;
  /** @type {{ text: String, author: String, timestamp: String }[]}*/
  export let items = [];
  export let updatePopupActive = false;

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
  let showWelcomeMessage = true;

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
    {#if showWelcomeMessage}
      <div class="message">
        <div class="heading">
          <h2>Welcome to LiveTL!</h2>
          <Button
            fab
            size="small"
            on:click={() => (showWelcomeMessage = false)}
          >
            <Icon path={mdiClose} />
          </Button>
        </div>
        <div class="subheading">
          Translations picked up from the chat will appear here.
          <p style="font-size: 0.8em;">
            <a
              href="https://livetl.app/"
              target="about:blank"
              on:click={(e) => {
                e.preventDefault();
                // eslint-disable-next-line no-unused-vars
                updatePopupActive = true;
              }}
            >
              See what's new in v{version}
            </a>
          </p>
        </div>
        <div class="subscripts">
          <div class="badges">
            <!--
          <a
            href="https://livetl.app/"
            target="about:blank"
            on:click={e => {
              e.preventDefault();
              // eslint-disable-next-line no-unused-vars
              updatePopupActive = true;
            }}
          >
            <img
              alt="Version"
              src="https://img.shields.io/badge/See what's new in-v{version}-blue?style=flat&color=ff69b4"
            />
          </a>
          <a
            href="https://chrome.google.com/webstore/detail/livetl-translation-filter/moicohcfhhbmmngneghfjfjpdobmmnlg"
            target="about:blank"
          >
            <img
              alt="Chrome Web Store"
              src="https://img.shields.io/chrome-web-store/users/moicohcfhhbmmngneghfjfjpdobmmnlg?color=blue&label=Chrome%20users&logo=google&logoColor=white&style=flat"
            />
          </a>
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/livetl/"
            target="about:blank"
          >
            <img
              alt="Mozilla Addons"
              src="https://img.shields.io/amo/users/livetl?color=blue&label=Firefox%20users&logo=mozilla&logoColor=white&style=flat"
            />
          </a>
          <a href="https://livetl.app/" target="about:blank">
            <img
              alt="Other platforms"
              src="https://img.shields.io/badge/Other%20platforms-Android%2C%20iOS-blue?style=flat"
            />
          </a>
          -->
            <a
              href="/"
              target="about:blank"
              on:click={(e) => {
                e.preventDefault();
                if (BROWSER === Browser.CHROME) {
                  window.open(
                    'https://chrome.google.com/webstore/detail/livetl-live-translations/moicohcfhhbmmngneghfjfjpdobmmnlg/reviews'
                  );
                } else if (BROWSER === Browser.FIREFOX) {
                  window.open(
                    'https://addons.mozilla.org/en-US/firefox/addon/livetl'
                  );
                } else {
                  window.open(
                    'https://chrome.google.com/webstore/detail/livetl-live-translations/moicohcfhhbmmngneghfjfjpdobmmnlg/reviews'
                  );
                }
              }}
            >
              <img
                alt="Reviews"
                src="https://img.shields.io/badge/Leave a review-5%20stars-blue?style=flat"
              />
            </a>
            <a href="https://github.com/LiveTL/LiveTL/" target="about:blank">
              <img
                alt="GitHub Repo"
                src="https://img.shields.io/github/stars/LiveTL/LiveTL?style=flat&logo=github&label=Star on GitHub"
              />
            </a>
            <!--
          <a href="https://livetl.app/" target="about:blank">
            <img
              alt="Website"
              src="https://img.shields.io/website?down_color=red&down_message=offline&label=Website&up_color=blue&up_message=livetl.app&url=http%3A%2F%2Flivetl.app%2F&style=flat"
            />
          </a>
          -->
            <a href="https://opencollective.com/livetl" target="about:blank">
              <img
                alt="Donators and supporters"
                src="https://img.shields.io/opencollective/all/livetl?color=blue&label=Donators%20and%20supporters&logo=dollar&style=flat"
              />
            </a>
            <!--
          <a
            href="https://hosted.weblate.org/engage/livetl/"
            target="about:blank"
          >
            <img
              alt="Localization"
              src="https://img.shields.io/badge/Localization-Weblate-blue"
            />
          </a>
          -->
            <a href="https://discord.gg/uJrV3tmthg" target="about:blank">
              <img
                alt="Discord"
                src="https://img.shields.io/discord/780938154437640232.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2&style=flat"
              />
            </a>
          </div>
        </div>
      </div>
    {:else if !items.length}
      <div class="message">
        <span> Translations picked up from the chat will appear here. </span>
      </div>
    {/if}
    {#each items as item}
      <div
        class="message"
        let:hovering
        style="display: {item.hidden ? 'none' : 'block'}"
      >
        {#if screenshotting}
          <Checkbox bind:group={selectedItems} value={item} />
        {/if}
        <span>{item.text}</span>
        <span class="info">
          <span
            class:moderator={item.types & AuthorType.moderator}
            class:owner={item.types & AuthorType.owner}
          >
            {item.author}
          </span>
          <span>{$showTimestamp ? `(${item.timestamp})` : ''}</span>
          <span class="messageActions">
            <span class="redHighlight" on:click={() => (item.hidden = true)}>
              <Icon path={mdiEyeOffOutline} size="1em" />
            </span>
            <span
              class="redHighlight"
              on:click={() => {
                channelFilters.set(item.id, {
                  ...channelFilters.get(item.id),
                  name: item.author,
                  blacklist: true,
                });
                items = items.filter((i) => i.id != item.id);
              }}
            >
              <Icon path={mdiAccountRemove} size="1em" />
            </span>
          </span>
        </span>
      </div>
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

  .message :global(.s-checkbox) {
    display: inline-flex;
    transform: translate(4px, 3px);
  }

  .messageActions {
    display: none;
  }

  .moderator {
    color: #a0bdfc !important;
  }

  .owner {
    color: #ffd600 !important;
  }

  .messageActions .redHighlight :global(.s-icon:hover) {
    color: #ff2873;
  }

  .message:hover .messageActions {
    display: inline-block !important;
    cursor: pointer;
  }
  .info {
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
