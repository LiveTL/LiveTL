<script lang="ts">
  import { createPopup } from '../ts/chat-utils';
  import { isLiveTL } from '../ts/chat-constants';
  import outline from '../assets/outline.svg?raw';
  import { onDestroy, onMount } from 'svelte';
  
  const openSettings = () => {
    createPopup(chrome.runtime.getURL(`${isLiveTL ? 'hyperchat/' : ''}options.html${document.documentElement.getAttribute('dark') === '' ? '?dark' : ''}`));
  };
  
  onMount(() => {
    console.debug('[HyperChat] Settings button created');
  });
  
  onDestroy(() => {
    console.debug('[HyperChat] Settings button destroyed');
  });
</script>

<div id="hc-settings" on:click={openSettings} class="button">
  <div class="button-icon-container">
    <div class="button-icon">
      {@html outline}
    </div>
  </div>
  <div class="button-label">HyperChat Settings</div>
</div>

<style>
  /* CSS Style as copied from BetterTTV albeit slightly modified: https://github.com/night/betterttv/blob/38daf2a12133286c6910db5bb39ccdfaf7a4ffd4/src/modules/settings/youtube/Settings.module.css */
  .button {
    display: flex;
    align-items: center;
    padding: 0px 36px 0px 16px;
    cursor: pointer;
    min-height: 36px;
  }

  .button:hover {
    background-color: var(--yt-spec-additive-background);
    border-radius: 8px;
  }

  .button-label {
    color: var(--yt-spec-text-primary);
    white-space: nowrap;
    font-family: "Roboto", "Arial", sans-serif;
    font-size: 1.4rem;
    line-height: 2rem;
    font-weight: 400;
    -webkit-font-smoothing: var(--paper-font-subhead_-_-webkit-font-smoothing);
  }

  .button-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    width: 24px;
    height: 24px;
  }
  
  .button-icon {
    color: var(--yt-sys-color-baseline--text-primary);
    display: flex;
    fill: currentColor;
    justify-content: center;
  }

  .button-icon :global(svg),
  .button-icon :global(path) {
    fill: currentColor;
  }
</style>
