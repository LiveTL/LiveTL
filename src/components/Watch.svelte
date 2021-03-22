<script>
  import { onMount } from "svelte";
  import * as j from "jquery";
  import "jquery-ui-bundle";
  import "jquery-ui-bundle/jquery-ui.css";
  import Options from "./Options.svelte";
  import VideoEmbed from "./VideoEmbed.svelte";
  import Wrapper from "./Wrapper.svelte";
  import { Button, Icon, MaterialApp } from "svelte-materialify/src";
  import { mdiClose, mdiCogOutline } from "@mdi/js";
  import {
    videoSide,
    videoPanelSize,
    chatSize,
    chatZoom,
    livetlZoom,
    textDirection,
  } from "../js/store.js";
  import { VideoSide, TextDirection } from "../js/constants.js";
  import ChatEmbed from "./ChatEmbed.svelte";
  import MessageDisplay from "./MessageDisplay.svelte";
  document.title = "LiveTL";
  window.j = j;
  let isResizing = false;
  let chatElem, vidElem, ltlElem;
  const resizable = (selector, info) => {
    j(document.querySelector(selector)).resizable(info);
  };
  const convertToPx = () => {
    [
      [chatElem, "height", chatSize],
      [vidElem, "width", videoPanelSize],
    ].forEach((item) => {
      const [elem, prop, store] = item;
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
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("video");
  const continuation = params.get("continuation");
  const isReplay = params.get("isReplay");
  let settingsOpen = false;
</script>

<MaterialApp theme="dark">
  <div class="flex vertical {$videoSide == VideoSide.RIGHT ? 'reversed' : ''}">
    <div
      class="tile resizable"
      style="width: {$videoPanelSize}%;"
      bind:this={vidElem}
    >
      <Wrapper {isResizing}>
        <VideoEmbed {videoId} />
      </Wrapper>
    </div>
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
          <div
            class="settingsButton {$textDirection === TextDirection.TOP
              ? 'bottom'
              : 'top'}Float"
            style="display: {isResizing ? 'none' : 'unset'};"
          >
            <Button
              fab
              size="small"
              on:click={() => (settingsOpen = !settingsOpen)}
            >
              <Icon path={settingsOpen ? mdiClose : mdiCogOutline} />
            </Button>
          </div>
          <Wrapper {isResizing} zoom={$livetlZoom}>
            <div style="display: {settingsOpen ? 'block' : 'none'};">
              <Options />
            </div>
            <div style="display: {settingsOpen ? 'none' : 'block'};">
              <MessageDisplay direction={$textDirection} />
            </div>
          </Wrapper>
        </div>
      </div>
    </div>
  </div>
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
