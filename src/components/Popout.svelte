<script>
  import { afterUpdate, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Button, Icon, MaterialApp, TextField } from 'svelte-materialify/src';
  import { mdiClose, mdiCogOutline, mdiArrowDown, mdiArrowUp, mdiCamera, mdiCheck, mdiExpandAllOutline, mdiDownload  } from '@mdi/js';
  import Options from './Options.svelte';
  import Wrapper from './Wrapper.svelte';
  import { TextDirection } from '../js/constants.js';
  import { textDirection, screenshotRenderWidth, videoTitle } from '../js/store.js';
  import MessageDisplay from './MessageDisplay.svelte';
  import ScreenshotExport from './ScreenshotExport.svelte';
  import Updates from './Updates.svelte';
  import { getRooms } from '../js/mchad.js';  
  import { updatePopupActive } from '../js/store.js';
  import { saveAs } from 'file-saver';
  let settingsOpen = false;
  export let isResizing = false;
  const params = new URLSearchParams(window.location.search);
  $videoTitle = params.get('title') || $videoTitle;
  $: document.title = $videoTitle || 'LiveTL Popout';
  export let isStandalone = params.get('embedded') ? true : false;
  export let videoId = '';

  let wrapper;
  let messageDisplay;
  let isAtRecent = true;

  const updateWrapper = () => [wrapper.isAtBottom(), wrapper.isAtTop()];

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
    tick().then(checkAtRecent);
  });

  let renderQueue;

  let isSelecting = false;

  function toggleSelecting() {
    isSelecting = !isSelecting;
  }

  let selectedItems = [];
  let allItems = [];

  function selectAllItems() {
    selectedItems = [...allItems];
  }

  let selectOperation = () => {};

  function saveScreenshot() {
    renderQueue = selectedItems.filter(d => !d.hidden);
    toggleSelecting();
    selectOperation = () => {};
  }

  function saveDownload() {
    const blob = new Blob([
      selectedItems.filter(
        d => !d.hidden
      ).map(
        d => `${d.author} (${d.timestamp}): ${d.text}`
      ).join('\n')], {
      type: 'text/plain;charset=utf-8'
    }
    );
    saveAs(blob, textFilename);
    toggleSelecting();
    selectOperation = () => {};
  }

  let renderWidth = '500';
  let textFilename = 'LiveTL_Stream_Log.txt';
  $: textFilename = `${$videoTitle}.txt`;
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

  <Updates bind:active={$updatePopupActive} />
  <div
    class="settingsButton {$textDirection === TextDirection.TOP
      ? 'bottom'
      : 'top'}Float"
    style="display: {isResizing
      ? 'none'
      : 'flex'}; flex-direction: row; align-items: center; flex-wrap: wrap;"
  >
    {#if isSelecting}
      <h6 class="floatingText">
        {selectedItems.length} TLs selected
      </h6>
      {#if selectOperation == saveScreenshot}
        <TextField
          dense
          bind:value={renderWidth}
          filled
          rules={[item => (isNaN(parseInt(item)) ? 'Invalid width' : true)]}
          class="widthInput">Width (px)</TextField
        >
      {/if}
      {#if selectOperation == saveDownload}
        <TextField
          dense
          bind:value={textFilename}
          filled
          rules={[item => (!item ? 'Invalid filename' : true)]}
          class="filenameInput">Filename</TextField
        >
      {/if}
    {/if}
    <div style="display: flex;">
      {#if isSelecting}
        <div class="blue-text">
          <Button fab size="small" on:click={selectAllItems}>
            <Icon path={mdiExpandAllOutline} />
          </Button>
        </div>
        <div class="green-text">
          <Button fab size="small" on:click={selectOperation}>
            <Icon path={mdiCheck} />
          </Button>
        </div>
        <div class={isSelecting ? 'red-text' : ''}>
          <Button fab size="small" on:click={toggleSelecting}>
            <Icon path={mdiClose} />
          </Button>
        </div>
      {/if}
      {#if !isSelecting}
        {#if !settingsOpen}
          <Button
            fab
            size="small"
            on:click={() => {
              toggleSelecting();
              selectOperation = saveScreenshot;
            }}
          >
            <Icon path={isSelecting ? mdiCheck : mdiCamera} />
          </Button>
          <Button
            fab
            size="small"
            on:click={() => {
              toggleSelecting();
              selectOperation = saveDownload;
            }}
          >
            <Icon path={isSelecting ? mdiCheck : mdiDownload} />
          </Button>
        {/if}
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
        bind:this={messageDisplay}
        on:afterUpdate={onMessageDisplayAfterUpdate}
        bind:isSelecting
        bind:selectedItems
        bind:items={allItems}
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
        <!-- scroll and reload isbottom and istop functions on click -->
        <Button
          fab
          size="small"
          on:click={() => messageDisplay.scrollToRecent()}
          on:click={updateWrapper}
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
  }
  .widthInput {
    width: 7em;
  }
  .filenameInput {
    width: 15em;
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
