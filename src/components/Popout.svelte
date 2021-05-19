<script>
  import { beforeUpdate, afterUpdate } from 'svelte';
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
  const params = new URLSearchParams(window.location.search);
  document.title = params.get('title') || 'LiveTL Popout';

  let wrapper;
  let messageDisplay;
  let isAtRecent = true;
  let checkTimer = null;
  let keepScrolling = false;
  let interruptScroll = false;
  let smoothScroll = true;
  let messageDisplayMargin = 0;
  const topScrollOffset = 1;

  function checkAtRecent() {
    if (!wrapper) return false;
    return ($textDirection === TextDirection.BOTTOM && wrapper.isAtBottom()) ||
      ($textDirection === TextDirection.TOP && wrapper.isAtTop(topScrollOffset));
  }

  function scrollToRecent() {
    if (!wrapper) return;

    if ($textDirection === TextDirection.BOTTOM) {
      wrapper.scrollToBottom();
    }
    else {
      wrapper.scrollToTop(topScrollOffset);
    }
  }

  function keepScrollingToRecent() {
    keepScrolling = true;
    scrollToRecent();
  }

  function updateMargin() {
    if (isResizing || settingsOpen) return;

    const wrapperHeight = wrapper.getClientHeight();
    const messageDisplayHeight = messageDisplay.getClientHeight();
    const offset = ($textDirection === TextDirection.BOTTOM ? 1 : 2);

    if (messageDisplayHeight > wrapperHeight) {
      messageDisplayMargin = 0;
    }
    else {
      messageDisplayMargin = wrapperHeight - messageDisplayHeight + offset;
    }
  }

  function onWrapperScroll() {
    if ($textDirection === TextDirection.TOP && checkAtRecent()) {
      wrapper.scrollToTop(topScrollOffset);
    }

    if (checkTimer !== null && !interruptScroll) {
      clearTimeout(checkTimer);
    }
    checkTimer = setTimeout(() => {
      updateMargin();
      const atRecent = checkAtRecent();

      if (keepScrolling && !atRecent && !interruptScroll) {
        scrollToRecent();
      }
      else {
        keepScrolling = false;
        interruptScroll = false;
        isAtRecent = atRecent;
      }
    }, 50);
  }

  function onWrapperKeyDown(e) {
    const keys = ['PageUp', 'PageDown', 'Home', 'End', 'ArrowDown', 'ArrowUp'];
    if (
      !checkAtRecent() && (
        (e.key === 'Home' && $textDirection === TextDirection.TOP) || 
        (e.key === 'End' && $textDirection === TextDirection.BOTTOM)
      )
    ) {
      keepScrollingToRecent();
    }
    else if (keys.includes(e.key)) {
      interruptScroll = true;
    }
  }

  function onMessageDisplayAfterUpdate() {
    if (isAtRecent && !settingsOpen) {
      keepScrollingToRecent();
    }
  }

  function onWrapperAfterUpdate() {
    if (!smoothScroll) {
      scrollToRecent();
      smoothScroll = true;
    }
  }

  let settingsWasOpen = false;
  let wasResizing = false;
  $: settingsWasOpen = !settingsOpen;
  $: wasResizing = !isResizing;
  beforeUpdate(() => {
    // Prevent smooth scrolling when exiting settings
    if (settingsWasOpen) {
      smoothScroll = false;
      settingsWasOpen = false;
    }
  });
  afterUpdate(() => {
    if (wasResizing && document.readyState === 'complete') {
      updateMargin();
      wasResizing = false;
    }
  });
</script>

<svelte:window 
  on:resize={() => {
    updateMargin();
    isAtRecent = checkAtRecent();
  }}
  on:load={() => {
    updateMargin();
    scrollToRecent();
  }}
/>

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
  <Wrapper
    {isResizing}
    {smoothScroll}
    bind:this={wrapper}
    on:scroll={onWrapperScroll}
    on:wheel={() => (interruptScroll = true)}
    on:keydown={onWrapperKeyDown}
    on:afterUpdate={onWrapperAfterUpdate}
  >
    {#if settingsOpen}
      <Options {isStandalone} {isResizing} />
    {/if}
    <div style="display: {settingsOpen ? 'none' : 'block'};">
      <MessageDisplay
        direction={$textDirection}
        margin={messageDisplayMargin}
        bind:updatePopupActive
        bind:this={messageDisplay}
        on:afterUpdate={onMessageDisplayAfterUpdate}
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
          on:click={keepScrollingToRecent}
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
