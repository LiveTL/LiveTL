<script>
  import { afterUpdate, tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { Button, Icon, MaterialApp, TextField, Tooltip } from 'svelte-materialify/src';
  import { mdiClose, mdiCogOutline, mdiArrowDown, mdiArrowUp, mdiCamera, mdiCheck, mdiExpandAllOutline, mdiDownload, mdiFullscreen } from '@mdi/js';
  import { mdiAccountVoiceOff } from '../js/svg.js';
  import Options from './Options.svelte';
  import Wrapper from './Wrapper.svelte';
  import { TextDirection, paramsVideoTitle, isAndroid } from '../js/constants.js';
  import { faviconURL, textDirection, screenshotRenderWidth, videoTitle, enableExportButtons, updatePopupActive, enableFullscreenButton, spotlightedTranslator, isResizing } from '../js/store.js';
  import MessageDisplay from './MessageDisplay.svelte';
  import ScreenshotExport from './ScreenshotExport.svelte';
  import Updates from './Updates.svelte';
  import { displayedMessages } from '../js/sources-aggregate.js';
  import { saveAs } from 'file-saver';
  let settingsOpen = false;
  $videoTitle = paramsVideoTitle || $videoTitle;
  $: document.title = $videoTitle || 'LiveTL Popout';

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
    if (isAtRecent && !settingsOpen) {
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
  let selectedItemCount = 0;

  function selectAllItems() {
    selectedItems = [...displayedMessages];
  }

  let selectOperation = () => {};

  function getSelectedItems() {
    return selectedItems.filter(d => !d.hidden);
  }

  $: selectedItems, selectedItemCount = getSelectedItems().length;

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
      const saveStr = toSave.join('\n');
      if (isAndroid) {
        // @ts-ignore
        window.nativeJavascriptInterface.downloadText(saveStr, textFilename);
      } else {
        const blob = new Blob([
          saveStr
        ], {
          type: 'text/plain;charset=utf-8'
        });
        saveAs(blob, textFilename);
      }
    }
    toggleSelecting();
    selectOperation = () => {};
  }

  let renderWidth = '500';
  let textFilename = 'LiveTL_Stream_Log.txt';
  $: textFilename = `${$videoTitle}.txt`;
  let renderWidthInt = null;
  $: renderWidthInt = parseInt(renderWidth);
  $: if (screenshotRenderWidth) {
    screenshotRenderWidth.set(renderWidthInt);
  }


  function toggleFullScreen() {
    if (isAndroid) {
      // @ts-ignore
      window.nativeJavascriptInterface.toggleFullscreen();
      return;
    }
    if (
      (document.fullScreenElement && document.fullScreenElement !== null) ||
      (!document.mozFullScreen && !document.webkitIsFullScreen)
    ) {
      if (document.documentElement.requestFullScreen) {
        document.documentElement.requestFullScreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullScreen) {
        document.documentElement.webkitRequestFullScreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
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
    class="settings-button d-flex"
    class:bottom-float={$textDirection === TextDirection.TOP}
    class:d-none={$isResizing}
  >
    {#if isSelecting}
      <h6 class="floating-text">
        {selectedItemCount} TLs selected
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
    <div class="d-flex">
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
        <div class:red-text={isSelecting}>
          <Button fab size="small" on:click={toggleSelecting}>
            <Icon path={mdiClose} />
          </Button>
        </div>
      {/if}
      {#if !isSelecting}
        {#if !settingsOpen && $spotlightedTranslator}
          <!-- Un-spotlight translator button -->
          <Tooltip bottom>
            <div transition:fly={{ x: -500, duration: 600 }}>
              <Button
                fab
                size="small"
                on:click={() => spotlightedTranslator.set(null)}
              >
                <Icon path={mdiAccountVoiceOff} />
              </Button>
            </div>
            <span slot="tip">Show other translators</span>
          </Tooltip>
        {/if}
        {#if !settingsOpen && $enableExportButtons}
          <!-- Screenshot button -->
          <Tooltip bottom>
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
            <span slot="tip">Screenshot translations</span>
          </Tooltip>
          <!-- Export translations button -->
          <Tooltip bottom>
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
            <span slot="tip">Export translations log (txt)</span>
          </Tooltip>
        {/if}
        {#if !settingsOpen && $enableFullscreenButton}
          <!-- Fullscreen button -->
          <Tooltip bottom>
            <Button fab size="small" on:click={toggleFullScreen}>
              <Icon path={mdiFullscreen} />
            </Button>
            <span slot="tip">Toggle fullscreen</span>
          </Tooltip>
        {/if}
        <!-- Settings button -->
        <Tooltip bottom>
          <Button
            fab
            size="small"
            on:click={() => (settingsOpen = !settingsOpen)}
          >
            <Icon path={settingsOpen ? mdiClose : mdiCogOutline} />
          </Button>
          <span slot="tip"
            >{settingsOpen ? 'Close settings' : 'Open settings'}</span
          >
        </Tooltip>
      {/if}
    </div>
  </div>
  <Wrapper on:scroll={updateWrapper} bind:this={wrapper}>
    <div class:d-none={!settingsOpen}>
      <Options bind:active={settingsOpen} />
    </div>
    <div class:d-none={settingsOpen}>
      <MessageDisplay
        direction={$textDirection}
        bind:this={messageDisplay}
        on:afterUpdate={onMessageDisplayAfterUpdate}
        bind:isSelecting
        bind:selectedItems
        items={$displayedMessages}
      />
    </div>
  </Wrapper>
  {#if !($isResizing || settingsOpen)}
    {#if !isAtRecent}
      <div
        class="recent-button"
        class:bottom-float={$textDirection !== TextDirection.TOP}
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
  .settings-button {
    position: absolute;
    top: 0px;
    right: 0px;
    padding: 5px;
    z-index: 100;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
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
  .floating-text {
    display: inline;
    margin-right: 5px;
    vertical-align: text-bottom;
    background-color: var(--theme-surface);
    border-radius: 5px;
    padding: 5px;
  }
  .recent-button {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 5px;
    z-index: 100;
    top: 0px;
    display: unset;
  }
  .bottom-float {
    bottom: 0px;
    top: unset;
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
