<script>
  import { afterUpdate, tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import Tooltip from '../submodules/chat/src/components/common/Tooltip.svelte';
  import Wrapper from './Wrapper.svelte';
  import {
    TextDirection,
    paramsVideoTitle,
    isAndroid,
    SelectOperation,
    paramsEmbedded,
    paramsVideoId,
    ChatSplit
  } from '../js/constants.js';
  import {
    faviconURL,
    textDirection,
    videoTitle,
    enableExportButtons,
    enableFullscreenButton,
    spotlightedTranslator,
    isResizing,
    isSelecting,
    screenshotRenderWidth,
    chatSplit,
    isChatInverted
  } from '../js/store.js';
  import UpdateComponent from './Updates.svelte';
  import MessageDisplay from './MessageDisplay.svelte';
  import { displayedMessages } from '../js/sources-aggregate.js';
  import dark from 'smelte/src/dark';
  import Button from './common/IconButton.svelte';
  import { openLiveTL } from '../js/utils.js';

  dark().set(true);

  export let settingsOpen = false;
  videoTitle.set(paramsVideoTitle || $videoTitle);
  $: textFilename = `${$videoTitle || 'LiveTL_Stream_Log'}.txt`;
  $: document.title = $videoTitle || 'LiveTL Popout';

  let wrapper;
  let messageDisplay;
  let isAtRecent = true;
  let selectOperation = null;

  const updateWrapper = () => [
    wrapper.isAtBottom(),
    wrapper.isAtTop(),
    setTimeout(checkAtRecent)
  ];

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

  let exportFilenameInputComponent,
    exportActionButtonsComponent,
    screenshotExportComponent;

  async function toggleSelecting() {
    if (!exportFilenameInputComponent || !exportActionButtonsComponent) {
      exportFilenameInputComponent = (
        await import('./ExportFilenameInput.svelte')
      ).default;
      exportActionButtonsComponent = (
        await import('./ExportActionButtons.svelte')
      ).default;
    }
    $isSelecting = !$isSelecting;
  }

  let selectedItems = [];
  $: selectedItemCount = getSelectedItems().length;

  function getSelectedItems() {
    return selectedItems.filter((d) => !d.hidden);
  }

  function selectAllItems() {
    selectedItems = [...$displayedMessages];
  }

  async function saveScreenshot() {
    if (!screenshotExportComponent) {
      screenshotExportComponent = (await import('./ScreenshotExport.svelte'))
        .default;
    }
    renderQueue = getSelectedItems();
    toggleSelecting();
  }

  async function saveDownload() {
    const toSave = getSelectedItems().map(
      (d) => `${d.author} (${d.timestamp}): ${d.text}`
    );
    if (toSave.length) {
      const saveStr = toSave.join('\n');
      if (isAndroid) {
        // @ts-ignore
        window.nativeJavascriptInterface.downloadText(saveStr, textFilename);
      } else {
        const blob = new Blob([saveStr], {
          type: 'text/plain;charset=utf-8'
        });
        const { default: saveAs } = await import('file-saver');
        saveAs(blob, textFilename);
      }
    }
    toggleSelecting();
  }

  function selectOperationCallback() {
    if (selectOperation === SelectOperation.SCREENSHOT) {
      saveScreenshot();
    } else if (selectOperation === SelectOperation.DOWNLOAD) {
      saveDownload();
    }
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

  $: floatingButtonPlacement = $isChatInverted
    ? `margin-${$chatSplit === ChatSplit.HORIZONTAL ? 'bottom' : 'right'}: var(--bar);`
    : '';
</script>

<svelte:window on:resize={updateWrapper} />
<svelte:head>
  <link rel="shortcut icon" href={$faviconURL} type="image/png" />
</svelte:head>

<svelte:component
  this={screenshotExportComponent}
  bind:renderQueue
  renderWidth={$screenshotRenderWidth}
/>
<UpdateComponent />

<div
  class="flex flex-row gap-2 absolute right-0 p-1 z-20 flex-wrap"
  class:bottom-0={$textDirection === TextDirection.TOP}
  class:top-0={$textDirection === TextDirection.BOTTOM}
  class:hidden={$isResizing}
>
  {#if $isSelecting}
    <svelte:component
      this={exportFilenameInputComponent}
      {selectOperation}
      {selectedItemCount}
      bind:textFilename
    />
  {/if}
  <div class="flex gap-2" style={floatingButtonPlacement}>
    {#if $isSelecting}
      <svelte:component
        this={exportActionButtonsComponent}
        on:run={selectOperationCallback}
        on:cancel={toggleSelecting}
        on:selectAllItems={selectAllItems}
      />
    {/if}
    {#if !$isSelecting}
      {#if !settingsOpen && $spotlightedTranslator}
        <!-- Un-spotlight translator button -->
        <Tooltip>
          <div slot="activator" transition:fly={{ x: -500, duration: 600 }}>
            <Button
              icon="voice_over_off"
              on:click={() => spotlightedTranslator.set(null)}
              color="dark"
              filled
            />
          </div>
          <span>Show other translators</span>
        </Tooltip>
      {/if}
      {#if !settingsOpen && $enableExportButtons}
        <!-- Screenshot button -->
        <Tooltip>
          <Button
            slot="activator"
            icon={$isSelecting ? 'check' : 'photo_camera'}
            on:click={() => {
              toggleSelecting();
              selectOperation = SelectOperation.SCREENSHOT;
            }}
            color="dark"
            filled
          />
          <span>Screenshot translations</span>
        </Tooltip>
        <!-- Export translations button -->
        <Tooltip>
          <Button
            slot="activator"
            icon={$isSelecting ? 'check' : 'download'}
            on:click={() => {
              toggleSelecting();
              selectOperation = SelectOperation.DOWNLOAD;
            }}
            color="dark"
            filled
          />
          <span>Export translations log (txt)</span>
        </Tooltip>
      {/if}
      {#if !settingsOpen && $enableFullscreenButton && !paramsEmbedded}
        <!-- Fullscreen button -->
        <Tooltip>
          <Button
            slot="activator"
            icon="fullscreen"
            on:click={toggleFullScreen}
            color="dark"
            filled
          />
          <span>Toggle fullscreen</span>
        </Tooltip>
      {:else if !settingsOpen && paramsEmbedded && $enableFullscreenButton}
        <Tooltip>
          <Button
            slot="activator"
            icon="open_in_full"
            on:click={() => openLiveTL(paramsVideoId)}
            color="dark"
            filled
          />
          <span>Expand LiveTL</span>
        </Tooltip>
      {/if}
      <!-- Settings button -->
      <Tooltip>
        <Button
          slot="activator"
          icon={settingsOpen ? 'close' : 'settings'}
          on:click={() => (settingsOpen = !settingsOpen)}
          color="dark"
          filled
        />
        <span>{settingsOpen ? 'Close settings' : 'Open settings'}</span>
      </Tooltip>
    {/if}
  </div>
</div>
<Wrapper on:scroll={updateWrapper} bind:this={wrapper}>
  {#if settingsOpen}
    <slot name="settings" />
  {:else}
    <div>
      <MessageDisplay
        direction={$textDirection}
        bind:this={messageDisplay}
        on:afterUpdate={onMessageDisplayAfterUpdate}
        bind:selectedItems
        items={$displayedMessages}
      />
    </div>
  {/if}
</Wrapper>
{#if !($isResizing || settingsOpen)}
  {#if !isAtRecent}
    <div
      class="recent-button absolute left-1/2 transform -translate-x-1/2 p-2 z-20"
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
        filled
      />
    </div>
  {/if}
{/if}

<style>
  :global(body) {
    overflow: hidden;
  }
</style>
