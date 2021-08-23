<script>
  import { afterUpdate, tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { Tooltip } from 'svelte-materialify/src';
  import Options from './Options.svelte';
  import Wrapper from './Wrapper.svelte';
  import { TextDirection, paramsVideoTitle, isAndroid } from '../js/constants.js';
  import { faviconURL, textDirection, screenshotRenderWidth, videoTitle, enableExportButtons, updatePopupActive, enableFullscreenButton, spotlightedTranslator, isResizing } from '../js/store.js';
  import MessageDisplay from './MessageDisplay.svelte';
  import ScreenshotExport from './ScreenshotExport.svelte';
  import Updates from './Updates.svelte';
  import { displayedMessages } from '../js/sources-aggregate.js';
  import { saveAs } from 'file-saver';
  import dark from 'smelte/src/dark';
  import Button from './common/IconButton.svelte';
  import TextField from './common/TextField.svelte';

  dark().set(true);

  let settingsOpen = false;
  $videoTitle = paramsVideoTitle || $videoTitle;
  $: document.title = $videoTitle || 'LiveTL Popout';

  let wrapper;
  let messageDisplay;
  let isAtRecent = true;

  // FIXME: Scroll to latest button broke again
  const updateWrapper = () => [wrapper.isAtBottom(), wrapper.isAtTop(), setTimeout(checkAtRecent)];

  function checkAtRecent () {
    if (wrapper == null) return;
    isAtRecent =
      ($textDirection === TextDirection.BOTTOM && wrapper.isAtBottom()) ||
      ($textDirection === TextDirection.TOP && wrapper.isAtTop());
  }

  function onMessageDisplayAfterUpdate () {
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

  function toggleSelecting () {
    isSelecting = !isSelecting;
  }

  let selectedItems = [];
  let selectedItemCount = 0;

  function selectAllItems () {
    selectedItems = [...displayedMessages];
  }

  let selectOperation = () => {};

  function getSelectedItems () {
    return selectedItems.filter(d => !d.hidden);
  }

  $: selectedItems, selectedItemCount = getSelectedItems().length;

  function saveScreenshot () {
    renderQueue = getSelectedItems();
    toggleSelecting();
    selectOperation = () => {};
  }

  function saveDownload () {
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


  function toggleFullScreen () {
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

<div>
  <div>
    <ScreenshotExport bind:renderQueue bind:renderWidth={renderWidthInt} />
  </div>

  <Updates bind:active={$updatePopupActive} />
  <div
    class="flex flex-row gap-2 absolute right-0 p-1 z-50"
    class:bottom-0={$textDirection === TextDirection.TOP}
    class:top-0={$textDirection === TextDirection.BOTTOM}
    class:hidden={$isResizing}
  >
    {#if isSelecting}
      <h6 class="inline p-2 bg-dark-700 flex-none h-full self-center">
        {selectedItemCount} TLs selected
      </h6>
      {#if selectOperation === saveScreenshot}
        <TextField
          dense
          bind:value={renderWidth}
          rules={[{ assert: item => (!isNaN(parseInt(item))), error: 'Invalid width' }]}
          label="Width (px)"
        />
      {:else if selectOperation === saveDownload}
        <TextField
          dense
          bind:value={textFilename}
          rules={[{ assert: item => (item), error: 'Invalid filename' }]}
          label="Filename"
        />
      {/if}
    {/if}
    <div class="flex gap-2">
      {#if isSelecting}
        <div class="flex-shrink-0">
          <Button
            icon="select_all"
            color="blue"
            on:click={selectAllItems}
            transparent={false}
          />
        </div>
        <div class="flex-shrink-0">
          <Button
            icon="check"
            color="success"
            on:click={selectOperation}
            transparent={false}
          />
        </div>
        <div class="flex-shrink-0">
          <Button
            icon="close"
            color="error"
            on:click={toggleSelecting}
            transparent={false}
          />
        </div>
      {/if}
      {#if !isSelecting}
        {#if !settingsOpen && $spotlightedTranslator}
          <!-- Un-spotlight translator button -->
          <Tooltip bottom>
            <div transition:fly={{ x: -500, duration: 600 }}>
              <Button
                icon="voice_over_off"
                on:click={() => spotlightedTranslator.set(null)}
                color="dark"
                transparent={false}
              />
            </div>
            <span slot="tip">Show other translators</span>
          </Tooltip>
        {/if}
        {#if !settingsOpen && $enableExportButtons}
          <!-- Screenshot button -->
          <Tooltip bottom>
            <Button
              icon={isSelecting ? 'check' : 'photo_camera'}
              on:click={() => {
                toggleSelecting();
                selectOperation = saveScreenshot;
              }}
              color="dark"
              transparent={false}
            />
            <span slot="tip">Screenshot translations</span>
          </Tooltip>
          <!-- Export translations button -->
          <Tooltip bottom>
            <Button
              icon={isSelecting ? 'check' : 'download'}
              on:click={() => {
                toggleSelecting();
                selectOperation = saveDownload;
              }}
              color="dark"
              transparent={false}
            />
            <span slot="tip">Export translations log (txt)</span>
          </Tooltip>
        {/if}
        {#if !settingsOpen && $enableFullscreenButton}
          <!-- Fullscreen button -->
          <Tooltip bottom>
            <Button
              icon="fullscreen"
              on:click={toggleFullScreen}
              color="dark"
              transparent={false}
            />
            <span slot="tip">Toggle fullscreen</span>
          </Tooltip>
        {/if}
        <!-- Settings button -->
        <Tooltip bottom>
          <Button
            icon={settingsOpen ? 'close' : 'settings'}
            on:click={() => (settingsOpen = !settingsOpen)}
            color="dark"
            transparent={false}
          />
          <span slot="tip"
            >{settingsOpen ? 'Close settings' : 'Open settings'}</span
          >
        </Tooltip>
      {/if}
    </div>
  </div>
  <Wrapper on:scroll={updateWrapper} bind:this={wrapper}>
    {#if settingsOpen}
      <Options />
    {:else}
      <MessageDisplay
        direction={$textDirection}
        bind:this={messageDisplay}
        on:afterUpdate={onMessageDisplayAfterUpdate}
        bind:isSelecting
        bind:selectedItems
        items={$displayedMessages}
      />
    {/if}
  </Wrapper>
  {#if !($isResizing || settingsOpen)}
    {#if !isAtRecent}
      <div
        class="absolute left-1/2 transform -translate-x-1/2 p-2 z-50"
        class:bottom-0={$textDirection === TextDirection.BOTTOM}
        class:top-0={$textDirection === TextDirection.TOP}
        transition:fade|local={{ duration: 150 }}
      >
        <!-- scroll and reload isbottom and istop functions on click -->
        <Button
          icon={$textDirection === TextDirection.TOP
            ? 'arrow_upward'
            : 'arrow_downward'}
          on:click={() => {
            messageDisplay.scrollToRecent();
            updateWrapper();
          }}
          transparent={false}
        />
      </div>
    {/if}
  {/if}
</div>

<style>
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
