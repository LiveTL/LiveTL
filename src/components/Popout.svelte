<script>
  import { afterUpdate } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Button, Icon, MaterialApp, TextField } from 'svelte-materialify/src';
  import { mdiClose, mdiCogOutline, mdiArrowDown, mdiArrowUp, mdiCamera, mdiCheck } from '@mdi/js';
  import Options from './Options.svelte';
  import Wrapper from './Wrapper.svelte';
  import { TextDirection } from '../js/constants.js';
  import { textDirection, screenshotRenderWidth } from '../js/store.js';
  import MessageDisplay from './MessageDisplay.svelte';
  import ScreenshotExport from './ScreenshotExport.svelte';
  import Updates from './Updates.svelte';
  import { getRooms } from '../js/mchad.js';  
  let settingsOpen = false;
  export let isResizing = false;
  export let updatePopupActive = false;
  const params = new URLSearchParams(window.location.search);
  document.title = params.get('title') || 'LiveTL Popout';
  export let isStandalone = params.get('embedded') ? true : false;
  export let videoId = '';

  let wrapper;
  let messageDisplay;
  let isAtRecent = true;

  function checkAtRecent() {
    isAtRecent =
      ($textDirection === TextDirection.BOTTOM && wrapper.isAtBottom()) ||
      ($textDirection === TextDirection.TOP && wrapper.isAtTop());
  }

  function onMessageDisplayAfterUpdate() {
    if (isAtRecent && !settingsOpen){
      messageDisplay.scrollToRecent();
    }
  }

  let settingsWasOpen = false;
  $: settingsWasOpen = !settingsOpen;
  afterUpdate(() => {
    if (settingsWasOpen) {
      messageDisplay.scrollToRecent();
      settingsWasOpen = false;
    }
    checkAtRecent();
  });

  let renderQueue;

  let screenshotting = false;

  function toggleScreenshot() {
    screenshotting = !screenshotting;
  }

  let selectedItems = [];
  function saveScreenshot() {
    renderQueue = selectedItems;
    toggleScreenshot();
  }

  let renderWidth = '500';
  let renderWidthInt = null;
  $: renderWidthInt = parseInt(renderWidth);
  $: if(screenshotRenderWidth) {
    $screenshotRenderWidth = renderWidthInt;
  }
</script>

<svelte:window on:resize={checkAtRecent} />
<svelte:head>
  <link rel="shortcut icon" href="48x48.png" type="image/png" />
</svelte:head>

<MaterialApp theme="dark">
  <div>
    <ScreenshotExport bind:renderQueue bind:renderWidth={renderWidthInt} />
  </div>

  <Updates bind:active={updatePopupActive} />
  <div
    class="settingsButton {$textDirection === TextDirection.TOP
      ? 'bottom'
      : 'top'}Float"
    style="display: {isResizing
      ? 'none'
      : 'flex'}; flex-direction: row; align-items: center; flex-wrap: wrap;"
  >
    {#if screenshotting}
      <h6 class="floatingText">
        {selectedItems.length} TLs selected
      </h6>
      <TextField
        dense
        bind:value={renderWidth}
        filled
        rules={[item => (isNaN(parseInt(item)) ? 'Invalid width' : true)]}
        >Width (px)</TextField
      >
    {/if}
    <div style="display: flex;">
      {#if !settingsOpen}
        <div class={screenshotting ? 'green-text' : ''}>
          <Button
            fab
            size="small"
            on:click={screenshotting ? saveScreenshot : toggleScreenshot}
          >
            <Icon path={screenshotting ? mdiCheck : mdiCamera} />
          </Button>
        </div>
      {/if}
      {#if screenshotting}
        <div class={screenshotting ? 'red-text' : ''}>
          <Button fab size="small" on:click={toggleScreenshot}>
            <Icon path={mdiClose} />
          </Button>
        </div>
      {/if}
      {#if !screenshotting}
        <Button
          fab
          size="small"
          on:click={() => (settingsOpen = !settingsOpen)}
        >
          <Icon path={settingsOpen ? mdiClose : mdiCogOutline} />
        </Button>
      {/if}
    </div>
  </div>
  <Wrapper {isResizing} on:scroll={checkAtRecent} bind:this={wrapper}>
    <div style="display: {settingsOpen ? 'block' : 'none'};">
      <Options {isStandalone} {isResizing} bind:active={settingsOpen} />
    </div>
    <div style="display: {settingsOpen ? 'none' : 'block'};">
      <MessageDisplay
        direction={$textDirection}
        bind:updatePopupActive
        bind:this={messageDisplay}
        on:afterUpdate={onMessageDisplayAfterUpdate}
        bind:screenshotting
        bind:selectedItems
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
        transition:fade|local={{ duration: 150 }}
      >
        <Button
          fab
          size="small"
          on:click={messageDisplay.scrollToRecent}
          class="elevation-3"
          style="background-color: #0287C3; border-color: #0287C3;"
        >
          <Icon
            path={$textDirection === TextDirection.TOP
              ? mdiArrowUp
              : mdiArrowDown}
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
  .settingsButton :global(.s-input) {
    display: inline-flex;
    background-color: var(--theme-surface);
    border-radius: 5px;
    width: 7em;
  }
  .floatingText {
    display: inline;
    margin-right: 5px;
    vertical-align: text-bottom;
    background-color: var(--theme-surface);
    border-radius: 5px;
    padding: 5px;
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
    margin-left: 5px;
  }
</style>
