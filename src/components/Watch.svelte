<script>
  import * as j from 'jquery';
  import 'jquery-ui-bundle';
  import 'jquery-ui-bundle/jquery-ui.css';
  import '../plugins/jquery.ui.touch-punch';
  import VideoEmbed from './VideoEmbed.svelte';
  import Wrapper from './Wrapper.svelte';
  import { MaterialApp } from 'svelte-materialify/src';
  import {
    videoSide,
    videoPanelSize,
    chatSize,
    chatZoom,
    showCaption,
    chatSplit,
    displayMode
  } from '../js/store.js';
  import {
    paramsVideoId,
    VideoSide,
    ChatSplit,
    paramsContinuation,
    paramsIsVOD,
    DisplayMode
  } from '../js/constants.js';
  import ChatEmbed from './ChatEmbed.svelte';
  import Popout from './Popout.svelte';
  import Captions from './Captions.svelte';

  document.title = 'LiveTL';
  let isResizing = false;
  let chatElem, vidElem, ltlElem;
  const resizable = (selector, info) => {
    j(typeof selector == 'string' ? document.querySelector(selector) : selector).resizable(info);
  };
  const convertPxAndPercent = () => {
    [
      [chatElem, $chatSplit == ChatSplit.VERTICAL ? 'width' : 'height', chatSize],
      [$displayMode === DisplayMode.FULLPAGE ? vidElem : null, $videoSide == VideoSide.TOP ? 'height' : 'width', videoPanelSize]
    ].forEach(item => {
      const [elem, prop, store] = item;
      if (!elem) return;
      if (isResizing) {
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
    isResizing = !isResizing;
    convertPxAndPercent();
  };
  const changeSide = () => {
    document.querySelectorAll('#mainUI .ui-resizable-handle').forEach(elem => {
      elem.remove();
    });
    
    resizable($videoSide == VideoSide.RIGHT ? chatSideElem : vidElem, {
      handles: $videoSide == VideoSide.TOP ? 's' : 'e',
      start: resizeCallback,
      stop: resizeCallback,
      resize: (_, dataobj) => {
        if ($videoSide == VideoSide.RIGHT) {
          $videoPanelSize = Math.min(100, Math.max(0, (1 - (dataobj.size.width / window.innerWidth)) * 100));
        }
      },
      containment: 'body'
    });
    resizable(chatElem, {
      handles: $chatSplit == ChatSplit.VERTICAL ? 'e' : 's',
      start: resizeCallback,
      stop: resizeCallback,
      resize: () => {},
      containment: 'body'
    });
  };
  $: setTimeout(() => changeSide($videoSide, $chatSplit), 0);
</script>

<div
  style="
  margin: 20px 0px 0px 20px;
  position: relative;
  width: 100vw;
  height: calc(100% - 40px);"
>
  <MaterialApp theme="dark">
    {#if $displayMode === DisplayMode.FULLPAGE && $showCaption}
      <Captions />
    {/if}
    <div
      id="mainUI"
      class="flex 
        {$videoSide == VideoSide.TOP ? 'horizontal' : 'vertical'} 
        {$videoSide == VideoSide.RIGHT ? 'reversed' : ''}"
    >
      {#if $displayMode === DisplayMode.FULLPAGE}
        <div
          class="tile resizable"
          style="{($videoSide == VideoSide.TOP ? 'height' : `width`) +
            `: ${$videoPanelSize}%;`}
            {$videoSide == VideoSide.LEFT
            ? 'min-width: 10px;'
            : $videoSide == VideoSide.TOP
            ? 'min-height: 10px'
            : ''}"
          bind:this={vidElem}
        >
          <Wrapper {isResizing}>
            <VideoEmbed videoId={paramsVideoId} />
          </Wrapper>
        </div>
      {/if}
      <div
        class="tile autoscale"
        bind:this={chatSideElem}
        style={$videoSide == VideoSide.TOP ? 'min-width: 100% !important;' : ''}
      >
        <div
          class="flex {$chatSplit == ChatSplit.VERTICAL
            ? 'vertical'
            : 'horizontal'}"
          style="
            {$videoSide == VideoSide.RIGHT ? 'width: calc(100% - 10px);' : ''}"
        >
          <div
            class="tile resizable"
            style="{$chatSplit == ChatSplit.VERTICAL
              ? 'width'
              : 'height'}: {$chatSize}%;
                min-{$chatSplit == ChatSplit.VERTICAL
              ? 'width'
              : 'height'}: 10px;
            "
            bind:this={chatElem}
          >
            <Wrapper
              {isResizing}
              zoom={$chatZoom}
              style={$chatSplit == ChatSplit.VERTICAL
                ? 'padding-right: 10px;'
                : 'padding-bottom: 10px;'}
            >
              <ChatEmbed
                videoId={paramsVideoId}
                continuation={paramsContinuation}
                isReplay={paramsIsVOD}
              />
            </Wrapper>
          </div>
          <div class="tile autoscale" bind:this={ltlElem}>
            <Popout {isResizing} />
          </div>
        </div>
      </div>
    </div>
  </MaterialApp>
</div>

<style>
  .horizontal {
    flex-direction: column;
  }
  .vertical {
    flex-direction: row;
  }
  .vertical.reversed {
    flex-direction: row-reverse;
  }
  .horizontal.reversed {
    flex-direction: column-reverse;
  }
  :root {
    --bar: 10px;
  }
  .vertical > .resizable {
    height: 100%;
  }
  .horizontal > .resizable {
    width: 100%;
  }
  .autoscale {
    flex: 1;
  }
  .tile {
    /* border: 5px solid blue; */
    display: flex;
    overflow: hidden;
    left: 0px !important;
    position: relative;
  }
  .flex {
    display: flex;
    height: 100%;
    width: 100%;
  }
  :global(body) {
    height: calc(100% + 40px) !important;
    position: fixed !important;
    top: -20px !important;
    left: -20px !important;
    margin: 0 !important;
    width: calc(100% + 40px) !important;
  }
  :global(.ui-resizable-handle) {
    background-color: #4d4d4d;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
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
  :global(.s-app) {
    height: 100%;
    width: 100%;
  }
  :global(*) {
    word-break: break-word;
  }
  :global(html) {
    overflow: hidden;
  }
  :global(.s-tooltip) {
    margin-left: 20px;
    margin-top: 20px;
  }
</style>
