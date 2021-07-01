<script>
  import { BROWSER, Browser, TextDirection } from '../js/constants.js';
  import { updatePopupActive, textDirection, welcomeDismissed } from '../js/store.js';
  import Minimizer from './Minimizer.svelte';
  import '../css/splash.css';

  const reviewLink = BROWSER === Browser.FIREFOX
    ? 'https://addons.mozilla.org/en-US/firefox/addon/livetl'
    : 'https://chrome.google.com/webstore/detail/livetl-live-translations/moicohcfhhbmmngneghfjfjpdobmmnlg/reviews';

  const badges = [
    {
      name: 'Leave a review',
      src: 'https://img.shields.io/badge/Leave a review-5%20stars-blue?style=flat',
      href: reviewLink
    },
    {
      name: 'Star on GitHub',
      src: 'https://img.shields.io/github/stars/LiveTL/LiveTL?style=flat&logo=github&label=Star on GitHub',
      href: 'https://github.com/LiveTL/LiveTL/'
    },
    {
      name: 'Donators and supporters',
      src: 'https://img.shields.io/opencollective/all/livetl?color=blue&label=Donators%20and%20supporters&logo=dollar&style=flat',
      href: 'https://opencollective.com/livetl'
    },
    {
      name: 'Discord',
      src: 'https://img.shields.io/discord/780938154437640232.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2&style=flat',
      href: 'https://discord.gg/uJrV3tmthg'
    }
  ];

  const { version } = window.chrome.runtime.getManifest();
</script>

<div class="message">
  {#if $textDirection == TextDirection.BOTTOM}
    <Minimizer />
  {/if}
  {#if !$welcomeDismissed}
    <div class="heading">
      <h2>Welcome to LiveTL!</h2>
    </div>
  {/if}
  <div class="subheading">
    Translations picked up from the chat will appear here.
    {#if !$welcomeDismissed}
      <p style="font-size: 0.8em;">
        <a
          href="https://livetl.app/"
          target="about:blank"
          on:click={(e) => {
            e.preventDefault();
            updatePopupActive.set(true);
          }}
        >
          See what's new in v{version}
        </a>
      </p>
    {/if}
  </div>
  {#if !$welcomeDismissed}
    <div class="badges">
      {#each badges as { name, src, href }}
        <a {href}>
          <img alt={name} {src} />
        </a>
      {/each}
    </div>
  {/if}
  {#if $textDirection == TextDirection.TOP}
    <Minimizer />
  {/if}
</div>

<style>
  h2 {
    font-size: 1.5em;
    line-height: 1.5em;
  }
  .badges {
    margin-top: 10px;
    font-size: 0.75em;
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

  .badges a {
    color: inherit !important;
    text-decoration: none;
  }

  .message {
    --margin: 5px;
    margin: var(--margin);
    padding: calc(1.5 * var(--margin));
    width: calc(100% - 2 * var(--margin));
    animation: splash 1s normal forwards ease-in-out;
    border-radius: var(--margin);
  }
</style>
