<script>
  import { onMount } from "svelte";
  import * as j from "jquery";
  import "jquery-ui-bundle";
  import "jquery-ui-bundle/jquery-ui.css";
  import VideoEmbed from "./VideoEmbed.svelte";
  import Wrapper from "./Wrapper.svelte";
  import { MaterialApp } from "svelte-materialify/src";
  import {
    videoSide,
    videoPanelSize,
    chatSize,
    chatZoom,
  } from "../js/store.js";
  import { VideoSide } from "../js/constants.js";
  import ChatEmbed from "./ChatEmbed.svelte";
  import Popout from "./Popout.svelte";
  document.title = "LiveTL";
  window.j = j;
  let isResizing = false;
  let chatElem, vidElem, ltlElem;
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("video");
  const continuation = params.get("continuation");
  const isReplay = params.get("isReplay");
  const isEmbedded = params.get("embedded");
  const resizable = (selector, info) => {
    j(document.querySelector(selector)).resizable(info);
  };
  const convertToPx = () => {
    [
      [chatElem, "height", chatSize],
      [isEmbedded ? vidElem : null, "width", videoPanelSize],
    ].forEach((item) => {
      const [elem, prop, store] = item;
      if (!elem) return;
      if (isResizing) {
        // elem.style.width = elem.clientWidth;
        // elem.style.height = elem.clientHeight;
      } else {
        let percent;
        if (prop === "height") {
          percent = (100 * elem.clientHeight) / window.innerHeight;
          elem.style.height = `${percent}%`;
        } else if (prop === "width") {
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
  const changeSide = (side) => {
    document.querySelectorAll(".ui-resizable-handle").forEach((elem) => {
      elem.remove();
    });
    resizable(".vertical .resizable", {
      handles: $videoSide == VideoSide.RIGHT ? "w" : "e",
      start: resizeCallback,
      stop: resizeCallback,
      resize: (event, ui) => {},
      // containment: 'body',
    });
    resizable(".vertical .autoscale .resizable", {
      handles: "s",
      start: resizeCallback,
      stop: resizeCallback,
      resize: (event, ui) => {},
      // containment: 'body',
    });
  };
  $: setTimeout(() => changeSide($videoSide), 0);
</script>

<MaterialApp theme="dark">
  <div class="flex vertical {$videoSide == VideoSide.RIGHT ? 'reversed' : ''}">
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
          <Popout {isResizing} />
        </div>
      </div>
    </div>
  </div>
</MaterialApp>

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
    height: 100%;
    position: absolute;
    margin: 0;
    width: 100%;
    margin: 0px;
  }
  :global(.ui-resizable-handle) {
    background-color: #4d4d4d;
  }
  :global(.ui-resizable-e) {
    width: var(--bar);
    right: 0px;
  }
  :global(.ui-resizable-w) {
    width: var(--bar);
    left: 0px;
  }
  :global(.ui-resizable-s) {
    height: var(--bar);
    bottom: 0px;
  }
  :global(.ui-resizable-n) {
    height: var(--bar);
    top: 0px;
  }
  :global(.s-app) {
    height: 100%;
    width: 100%;
  }
  :global(*) {
    word-break: break-word;
  }
</style>
