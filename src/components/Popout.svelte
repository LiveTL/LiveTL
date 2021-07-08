<script>
  import { afterUpdate, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Button, Icon, MaterialApp, TextField } from 'svelte-materialify/src';
  import { mdiClose, mdiCogOutline, mdiArrowDown, mdiArrowUp, mdiCamera, mdiCheck, mdiExpandAllOutline, mdiDownload  } from '@mdi/js';
  import Options from './Options.svelte';
  import Wrapper from './Wrapper.svelte';
  import { TextDirection } from '../js/constants.js';
  import { faviconURL, textDirection, screenshotRenderWidth, videoTitle, enableExportButtons, updatePopupActive } from '../js/store.js';
  import MessageDisplay from './MessageDisplay.svelte';
  import ScreenshotExport from './ScreenshotExport.svelte';
  import Updates from './Updates.svelte';
  import { saveAs } from 'file-saver';
  let settingsOpen = false;
  export let isResizing = false;
  const params = new URLSearchParams(window.location.search);
  $videoTitle = params.get('title') || $videoTitle;
  $: document.title = $videoTitle || 'LiveTL Popout';
  export let isStandalone = params.get('embedded') ? true : false;

  let wrapper;
  let messageDisplay;
  let isAtRecent = true;

  const updateWrapper = () => [wrapper.isAtBottom(), wrapper.isAtTop(), setTimeout(checkAtRecent)];

  function checkAtRecent() {
    if (wrapper == null) return;
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

  function getSelectedItems() {
    return selectedItems.filter(d => !d.hidden);
  }

  function saveScreenshot() {
    renderQueue = getSelectedItems();
    toggleSelecting();
    selectOperation = () => {};
  }

  function saveDownload() {
    const toSave = getSelectedItems().map(
      d => `${d.author} (${d.timestamp}): ${d.text}`
    );
    if (toSave.length) {
      const blob = new Blob([
        toSave.join('\n')], {
        type: 'text/plain;charset=utf-8'
      }
      );
      saveAs(blob, textFilename);
    }
    toggleSelecting();
    selectOperation = () => {};
  }

  let renderWidth = '500';
  let textFilename = 'LiveTL_Stream_Log.txt';
  $: textFilename = `${$videoTitle}.txt`;
  let renderWidthInt = null;
  $: renderWidthInt = parseInt(renderWidth);
  $: if(screenshotRenderWidth) {
    screenshotRenderWidth.set(renderWidthInt);
  }
</script>

<svelte:window on:resize={updateWrapper} />
<svelte:head>
  <link rel="shortcut icon" href={$faviconURL} type="image/png" />
</svelte:head>

<MaterialApp theme="dark">
  <div>
    <ScreenshotExport bind:renderQueue bind:renderWidth={renderWidthInt} />
  </div>

  <Updates bind:active={$updatePopupActive} />
  <div
    class="settings-button {$textDirection === TextDirection.TOP
      ? 'bottom'
      : 'top'}Float"
    style="display: {isResizing
      ? 'none'
      : 'flex'}; flex-direction: row; align-items: center; flex-wrap: wrap;"
  >
    {#if isSelecting}
      <h6 class="floatingText">
        {getSelectedItems().length} TLs selected
      </h6>
      {#if selectOperation == saveScreenshot}
        <TextField
          dense
          bind:value={renderWidth}
          filled
          rules={[item => (isNaN(parseInt(item)) ? 'Invalid width' : true)]}
          class="width-input">Width (px)</TextField
        >
      {/if}
      {#if selectOperation == saveDownload}
        <TextField
          dense
          bind:value={textFilename}
          filled
          rules={[item => (!item ? 'Invalid filename' : true)]}
          class="filename-input">Filename</TextField
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
        {#if !settingsOpen && $enableExportButtons}
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
  <Wrapper {isResizing} on:scroll={updateWrapper} bind:this={wrapper}>
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
  .settings-button {
    position: absolute;
    right: 0px;
    padding: 5px;
    z-index: 100;
  }
  .settings-button :global(.s-input) {
    display: inline-flex;
    background-color: var(--theme-surface);
    border-radius: 5px;
  }
  .settings-button :global(.width-input) {
    width: 7em;
  }
  .settings-button :global(.filename-input) {
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
