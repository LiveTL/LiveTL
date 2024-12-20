<script>
  import * as j from 'jquery';
  import 'jquery-ui-bundle';
  import 'jquery-ui-bundle/jquery-ui.css';
  import '../plugins/jquery.ui.touch-punch';
  import VideoEmbed from './VideoEmbed.svelte';
  import Wrapper from './Wrapper.svelte';
  import {
    videoSide,
    videoPanelSize,
    chatSize,
    chatZoom,
    showCaption,
    chatSplit,
    displayMode,
    isResizing,
    isChatInverted
  } from '../js/store.js';
  import {
    paramsYtVideoId,
    VideoSide,
    ChatSplit,
    paramsContinuation,
    paramsIsVOD,
    DisplayMode
  } from '../js/constants.js';
  import { onKeyEvent } from '../js/shortcuts.js';
  import ChatEmbed from './ChatEmbed.svelte';
  import MainPane from './MainPane.svelte';
  import Options from './OptionsDisplay.svelte';
  import Captions from './Captions.svelte';

  document.title = 'LiveTL';
  let chatElem, vidElem, ltlElem;
  const resizable = (selector, info) => {
    j(
      typeof selector === 'string' ? document.querySelector(selector) : selector
    ).resizable(info);
  };
  const convertPxAndPercent = () => {
    [
      [
        $isChatInverted ? ltlElem : chatElem,
        isChatVertical ? 'width' : 'height',
        chatSize
      ],
      [
        isFullPage ? vidElem : null,
        isTopSide ? 'height' : 'width',
        videoPanelSize
      ]
    ].forEach((item) => {
      const [elem, prop, store] = item;
      if (!elem) return;
      if ($isResizing) {
        // elem.style.width = elem.clientWidth;
        // elem.style.height = elem.clientHeight;
      } else {
        let percent;
        if (prop === 'height') {
          percent = (100 * elem.clientHeight) / elem.parentElement.clientHeight;
          elem.style.height = `${percent}%`;
        } else if (prop === 'width') {
          percent = (100 * elem.clientWidth) / elem.parentElement.clientWidth;
          elem.style.width = `${percent}%`;
        }
        store.set(percent);
      }
    });
  };

  let chatSideElem;

  const resizeCallback = () => {
    $isResizing = !$isResizing;
    convertPxAndPercent();
  };
  const changeSide = () => {
    document
      .querySelectorAll('#mainUI .ui-resizable-handle')
      .forEach((elem) => {
        elem.remove();
      });

    resizable(isRightSide ? chatSideElem : vidElem, {
      handles: isTopSide ? 's' : 'e',
      start: resizeCallback,
      stop: resizeCallback,
      resize: (_, dataobj) => {
        if (isRightSide) {
          $videoPanelSize = Math.min(
            100,
            Math.max(0, (1 - dataobj.size.width / window.innerWidth) * 100)
          );
        }
      },
      containment: 'body'
    });
    resizable($isChatInverted ? ltlElem : chatElem, {
      handles: isChatVertical ? 'e' : 's',
      start: resizeCallback,
      stop: resizeCallback,
      resize: () => {},
      containment: 'body'
    });
  };
  $: if ($videoSide || $chatSplit || $isChatInverted) {
    setTimeout(changeSide, 0);
  }

  const getFlexDirection = (isTopSide, isRightSide) => {
    if (isRightSide && isTopSide) return 'flex-col-reverse';
    else if (isRightSide && !isTopSide) return 'flex-row-reverse';
    else if (!isRightSide && isTopSide) return 'flex-col';
    else return 'flex-row';
  };

  $: isRightSide = $videoSide === VideoSide.RIGHT;
  $: isTopSide = $videoSide === VideoSide.TOP;
  $: isLeftSide = $videoSide === VideoSide.LEFT;
  $: isFullPage = $displayMode === DisplayMode.FULLPAGE;
  $: isChatVertical = $chatSplit === ChatSplit.VERTICAL && isFullPage;

  $: chatElemStyle =
    (isChatVertical
      ? `width: ${$chatSize}%; min-width: `
      : `height: ${$chatSize}%; min-height: `) + '10px;';
  $: videoContainerStyle =
    (isTopSide ? 'height' : 'width') +
    `: ${$videoPanelSize}%; ` +
    (isLeftSide ? 'min-width: 10px;' : isTopSide ? 'min-height: 10px;' : '');
  $: chatElemParentStyle = isRightSide ? 'width: calc(100% - 10px);' : '';
  $: chatWrapperStyle = `padding-${isChatVertical ? 'right' : 'bottom'}: 10px;`;
  $: flexDirection = getFlexDirection(isTopSide, isRightSide);
</script>

<svelte:window on:keydown={onKeyEvent} />

<div class="watch-wrapper relative w-screen bg-dark-500">
  {#if isFullPage && $showCaption}
    <Captions />
  {/if}
  <div id="mainUI" class="flex w-full h-full {flexDirection} top-0 absolute">
    {#if isFullPage}
      <div
        class="z-30 resizable relative"
        style={videoContainerStyle}
        bind:this={vidElem}
      >
        <Wrapper>
          <VideoEmbed videoId={paramsYtVideoId} />
        </Wrapper>
      </div>
    {/if}
    <div
      class="flex-1 relative"
      bind:this={chatSideElem}
      style={isTopSide ? 'min-width: 100% !important;' : ''}
    >
      <div
        class="flex w-full h-full {
          isChatVertical
            ? $isChatInverted ? 'flex-row-reverse' : 'flex-row'
            : $isChatInverted ? 'flex-col-reverse' : 'flex-col'
        }"
        style={chatElemParentStyle}
      >
        <div
          style={$isChatInverted ? '' : chatElemStyle} 
          class="relative {$isChatInverted ? 'flex-1' : 'resizable'}"
          bind:this={chatElem}
        >
          <Wrapper zoom={$chatZoom} style={chatWrapperStyle}>
            <ChatEmbed
              videoId={paramsYtVideoId}
              continuation={paramsContinuation}
              isReplay={paramsIsVOD}
            />
          </Wrapper>
        </div>
        <div 
          style={$isChatInverted ? chatElemStyle : ''} 
          class="relative {$isChatInverted ? 'resizable' : 'flex-1'}"
          bind:this={ltlElem}
        >
          <MainPane>
            <Options slot="settings" />
          </MainPane>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* The following 2 blocks are workarounds for jquery ui jank */
  .watch-wrapper {
    margin: 20px 0px 0px 20px;
    height: calc(100% - 40px);
  }
  :global(body) {
    height: calc(100% + 40px) !important;
    position: fixed !important;
    top: -20px !important;
    left: -20px !important;
    margin: 0 !important;
    width: calc(100% + 40px) !important;
  }

  :root {
    --bar: 10px;
  }
  :global(.ui-resizable-handle) {
    background-color: #4d4d4d;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: 5 !important;
  }
  :global(.ui-resizable-e) {
    width: var(--bar);
    right: 10px;
    transform: translateX(10px);
  }
  :global(.ui-resizable-w) {
    width: var(--bar);
    left: 10px;
    transform: translateX(-10px);
  }
  :global(.ui-resizable-s) {
    height: var(--bar);
    bottom: 0px;
  }
  :global(.ui-resizable-n) {
    height: var(--bar);
    top: 0px;
  }
  :global(.ui-resizable-e::after),
  :global(.ui-resizable-w::after) {
    content: '⋮';
    font-size: 30px;
  }
  :global(.ui-resizable-s::after),
  :global(.ui-resizable-n::after) {
    content: '⋯';
    font-size: 30px;
    transform: translateY(-2px);
    position: absolute;
  }
</style>
