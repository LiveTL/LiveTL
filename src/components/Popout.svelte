<script>
  import { afterUpdate } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Button, Icon, MaterialApp } from 'svelte-materialify/src';
  import { mdiClose, mdiCogOutline, mdiArrowDown, mdiArrowUp } from '@mdi/js';
  import Options from './Options.svelte';
  import Wrapper from './Wrapper.svelte';
  import { TextDirection } from '../js/constants.js';
  import { textDirection } from '../js/store.js';
  import MessageDisplay from './MessageDisplay.svelte';
  let settingsOpen = false;
  export let isStandalone = false;
  export let isResizing = false;
  export let updatePopupActive = false;
  document.title = 'LiveTL Popout';

  let wrapper;
  let messageDisplay;
  let isAtRecent = true;

  function checkAtRecent() {
    isAtRecent =
      ($textDirection === TextDirection.BOTTOM && wrapper.isAtBottom()) ||
      ($textDirection === TextDirection.TOP && wrapper.isAtTop());
  }

  afterUpdate(() => checkAtRecent());
</script>

<svelte:window on:resize={checkAtRecent} />

<MaterialApp theme="dark">
  <div
    class="settingsButton {$textDirection === TextDirection.TOP
      ? 'bottom'
      : 'top'}Float"
    style="display: {isResizing ? 'none' : 'unset'};"
  >
    <Button fab size="small" on:click={() => (settingsOpen = !settingsOpen)}>
      <Icon path={settingsOpen ? mdiClose : mdiCogOutline} />
    </Button>
  </div>
  <Wrapper {isResizing} on:scroll={checkAtRecent} bind:this={wrapper}>
    {#if settingsOpen}
      <Options {isStandalone} {isResizing} />
    {/if}
    <div style="display: {settingsOpen ? 'none' : 'block'};">
      <MessageDisplay
        direction={$textDirection}
        {settingsOpen}
        bind:updatePopupActive
        bind:this={messageDisplay}
      />
    </div>
  </Wrapper>
  {#if !(isResizing || settingsOpen)}
    {#if !isAtRecent}
      <div
        class="recentButton {$textDirection === TextDirection.TOP
          ? 'top'
          : 'bottom'}Float"
        style="display: 'unset';"
        transition:fade|local="{{duration: 150}}"
      >
        <Button
          fab
          size="small"
          on:click={messageDisplay.scrollToRecent}
          class="elevation-3"
          style="background-color: #0287C3; border-color: #0287C3;"
        >
          <Icon
            path={
              $textDirection === TextDirection.TOP ? mdiArrowUp : mdiArrowDown
            }
          />
        </Button>
      </div>
    {/if}
  {/if}
</MaterialApp>

<style>
  .bottomFloat {
    bottom: 0px;
  }
  .topFloat {
    top: 0px;
  }
  .settingsButton {
    position: absolute;
    right: 0px;
    padding: 5px;
    z-index: 100;
  }
  .recentButton {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 5px;
    z-index: 100;
  }
  :global(body) {
    overflow: hidden;
  }
  :global(.s-app) {
    height: 100%;
  }
  :global(.s-btn) {
    vertical-align: top !important;
  }
</style>
