<script lang="ts">
  import '../stylesheets/scrollbar.css';
  import { dataTheme } from '../ts/storage';
  import '../stylesheets/ui.css';
  import '../stylesheets/line.css';
  // import { isLiveTL } from '../ts/chat-constants';
  import YtcFilterConfirmation from './YtcFilterConfirmation.svelte';
  import YtcFilterInputDialog from './YtcFilterInputDialog.svelte';
  import YtcFilterGeneral from './settings/YtcFilterGeneral.svelte';
  import YtcFilterFilters from './settings/YtcFilterFilters.svelte';
  import { exioButton, exioComponent } from 'exio/svelte';
  import YtcFilterArchives from './settings/YtcFilterArchives.svelte';
  import { redirectIfInitialSetup } from '../ts/ytcf-logic';
  import { onMount } from 'svelte';
  $: document.documentElement.setAttribute('data-theme', $dataTheme);
  const params = new URLSearchParams(window.location.search);
  const isArchiveLoadSelection = params.get('isArchiveLoadSelection') === 'true';
  const tabs = [{
    name: 'Filters',
    component: YtcFilterFilters
  }, {
    name: 'Archives',
    component: YtcFilterArchives as any,
    props: {
      isArchiveLoadSelection
    },
    freeScale: true
  }, {
    name: 'Other',
    component: YtcFilterGeneral
  }];
  let tabIndex = isArchiveLoadSelection ? 1 : 0;
  onMount(async () => {
    await redirectIfInitialSetup();
  });
</script>

<svelte:head>
  <title>YtcFilter Settings</title>
</svelte:head>

<YtcFilterConfirmation />
<YtcFilterInputDialog />

{#if !isArchiveLoadSelection}
  <div class="navbar">
    {#each tabs as tab, i}
      <button class="navbar-item" use:exioButton on:click={() => {
        tabIndex = i;
      }} class:blue-text={tabIndex === i}>
        {tab.name}
      </button>
    {/each}
    <div class="navbar-underline blue-bg" style={`width: ${100 / tabs.length}%; transform: translateX(${tabIndex * 100}%)`} />
  </div>
{/if}
<div
  class="wrapper"
  style="scrollbar-width: thin; scrollbar-color: #888 transparent; user-select: none; {isArchiveLoadSelection ? '' : 'padding-top: 42px;'}"
  data-theme={$dataTheme}
>
  <div class="settings-card" use:exioComponent style={tabs[tabIndex].freeScale ? 'max-width: unset !important;' : ''}>
    <svelte:component this={tabs[tabIndex].component} {...(tabs[tabIndex].props ? tabs[tabIndex].props : {})} />
  </div>
</div>

<style>
  :global(html) {
    background-color: white;
  }
  :global(html[data-theme='dark']) {
    background-color: black;
  }
  .wrapper {
    font-size: 1rem;
    height: 100%;
  }
  .navbar {
    height: 50px;
    position: fixed;
    display: flex;
    color: white;
    justify-content: space-evenly;
    width: 100%;
    align-items: center;
    font-size: 1rem;
    top: 0px;
    left: 0px;
    background-color: #ececec;
    z-index: 1000;
  }
  :global([data-theme='dark']) .navbar {
    background-color: #131313;
  }
  .navbar-item {
    width: 100%;
    height: 100%;
    margin-bottom: 2px;
    background-color: transparent;
    color: initial;
    background-color: #ececec;
    color: black;
  }
  :global([data-theme='dark']) .navbar-item {
    color: white;
    background-color: #131313;
  }
  :global([data-theme='dark']) .navbar-underline {
    box-shadow: 0px 1px 10px #0080e9;
  }
  .navbar-underline {
    position: absolute;
    bottom: 0px;
    left: 0px;
    height: 2px;
    z-index: -1;
    transition: transform 0.15s ease-in-out;
    box-shadow: 0px 1px 10px #5dceff;
  }
</style>
