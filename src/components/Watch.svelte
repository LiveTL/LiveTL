<script>
  import * as j from 'jquery';
  import 'jquery-ui-bundle';
  import 'jquery-ui-bundle/jquery-ui.css';
  window.jQuery = j;
  import('jquery-ui-touch-punch');
  import VideoEmbed from './VideoEmbed.svelte';
  import Wrapper from './Wrapper.svelte';
  import { MaterialApp } from 'svelte-materialify/src';
  import {
    videoSide,
    videoPanelSize,
    chatSize,
    chatZoom,
    showCaption
  } from '../js/store.js';
  import { VideoSide } from '../js/constants.js';
  import ChatEmbed from './ChatEmbed.svelte';
  import Popout from './Popout.svelte';
  import Captions from './Captions.svelte';
  import Updates from './Updates.svelte';
  document.title = 'LiveTL';
  let isResizing = false;
  let chatElem, vidElem, ltlElem;
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get('video');
  const continuation = params.get('continuation');
  const isReplay = params.get('isReplay');
  const isEmbedded = params.get('embedded');
  const resizable = (selector, info) => {
    j(document.querySelector(selector)).resizable(info);
  };
  const convertToPx = () => {
    [
      [chatElem, 'height', chatSize],
      [isEmbedded ? null : vidElem, 'width', videoPanelSize]
    ].forEach(item => {
      const [elem, prop, store] = item;
      if (!elem) return;
      if (isResizing) {
        // elem.style.width = elem.clientWidth;
        // elem.style.height = elem.clientHeight;
      } else {
        let percent;
        if (prop === 'height') {
          percent = (100 * elem.clientHeight) / window.innerHeight;
          elem.style.height = `${percent}%`;
        } else if (prop === 'width') {
          percent = (100 * elem.clientWidth) / window.innerWidth;
          elem.style.width = `${percent}%`;
        }
        store.set(percent);
      }
    });
  };
  const resizeCallback = () => {
    isResizing = !isResizing;
    convertToPx();
  };
  const changeSide = () => {
    document.querySelectorAll('#mainUI .ui-resizable-handle').forEach(elem => {
      elem.remove();
    });
    resizable('.vertical .resizable', {
      handles: $videoSide == VideoSide.RIGHT ? 'w' : 'e',
      start: resizeCallback,
      stop: resizeCallback,
      resize: () => {},
      containment: 'body'
    });
    resizable('.vertical .autoscale .resizable', {
      handles: 's',
      start: resizeCallback,
      stop: resizeCallback,
      resize: () => {},
      containment: 'body'
    });
  };
  $: setTimeout(() => changeSide($videoSide), 0);
  let updatePopupActive = false;
</script>

<div
  style="
  margin: 20px 0px 0px 20px;
  position: relative;
  width: 100vw;
  height: 100vh;"
>
  <MaterialApp theme="dark">
    <Updates bind:active={updatePopupActive} />
    {#if !isEmbedded && $showCaption}
      <Captions />
    {/if}
    <div
      id="mainUI"
      class="flex vertical {$videoSide == VideoSide.RIGHT ? 'reversed' : ''}"
    >
      {#if !isEmbedded}
        <div
          class="tile resizable"
          style="width: {$videoPanelSize}%;"
          bind:this={vidElem}
        >
          <Wrapper {isResizing}>
            <VideoEmbed {videoId} />
          </Wrapper>
        </div>
      {/if}
      <div class="tile autoscale">
        <div class="flex horizontal">
          <div
            class="tile resizable"
            style="height: {$chatSize}%"
            bind:this={chatElem}
          >
            <Wrapper {isResizing} zoom={$chatZoom}>
              <ChatEmbed {videoId} {continuation} {isReplay} />
            </Wrapper>
          </div>
          <div class="tile autoscale" bind:this={ltlElem}>
            <Popout {isResizing} bind:updatePopupActive />
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
    overflow: auto;
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
</style>
