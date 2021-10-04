<script lang="ts">
  import {
    BROWSER,
    Browser,
    TextDirection,
    DisplayMode
  } from '../js/constants.js';
  import {
    updatePopupActive,
    textDirection,
    welcomeDismissed,
    displayMode
  } from '../js/store.js';
  import Minimizer from './Minimizer.svelte';
  import '../css/splash.css';

  const reviewLink =
    BROWSER === Browser.FIREFOX
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

<div class="rounded bg-gray-900 px-2 py-1 m-1 flex flex-col gap-1">
  {#if $textDirection === TextDirection.BOTTOM}
    <Minimizer />
  {/if}
  {#if !$welcomeDismissed}
    <h5 style="font-size: 1.5em;">
      Welcome to LiveTL{#if $displayMode === DisplayMode.HOLODEX}
        <span style="font-size: 0.75em;">&nbsp;<i>Lite</i></span>
      {/if}!
    </h5>
  {/if}
  <h6 style="font-size: 1em;">
    Translations picked up from the chat will appear here.
  </h6>
  {#if !$welcomeDismissed}
    <div>
      <a
        class="text-blue-400 underline"
        href="https://livetl.app/"
        target="about:blank"
        style="font-size: 0.875em;"
        on:click={(e) => {
          e.preventDefault();
          updatePopupActive.set(true);
        }}
      >
        See what's new in v{version}
      </a>
    </div>
    {#if $displayMode !== DisplayMode.HOLODEX}
      <div class="flex flex-wrap gap-1 py-1">
        {#each badges as { name, src, href }}
          <a {href}>
            <img alt={name} {src} style="height: 1.1em;" />
          </a>
        {/each}
      </div>
    {/if}
  {/if}
  {#if $textDirection === TextDirection.TOP}
    <Minimizer />
  {/if}
</div>
