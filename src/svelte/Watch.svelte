<script>
  import { onMount } from "svelte";
  import * as j from "jquery";
  import "jquery-ui-bundle";
  import "jquery-ui-bundle/jquery-ui.css";
  import Options from "./Options.svelte";
  import VideoEmbed from "./VideoEmbed.svelte";
  import Wrapper from "./Wrapper.svelte";
  import { videoSide } from "../js/store.js";
  import { VideoSide } from "../js/constants.js";
  window.j = j;
  let isResizing = false;
  function resizable(selector, info) {
    j(document.querySelector(selector)).resizable(info);
  }
  const changeSide = (side) => {
    document.querySelectorAll(".ui-resizable-handle").forEach((elem) => {
      elem.remove();
    });
    resizable(".vertical .resizable", {
      handles: $videoSide == VideoSide.RIGHT ? "w" : "e",
      start: () => (isResizing = true),
      stop: () => (isResizing = false),
      resize: (event, ui) => {},
      // containment: "body",
    });
    resizable(".vertical .autoscale .resizable", {
      handles: "s",
      start: () => (isResizing = true),
      stop: () => (isResizing = false),
      resize: (event, ui) => {},
      // containment: "body",
    });
  };
  $: changeSide($videoSide);
  onMount(() => changeSide($videoSide));
</script>

<div class="flex vertical {$videoSide == VideoSide.RIGHT ? 'reversed' : ''}">
  <div class="tile resizable">
    <Wrapper {isResizing}>
      <VideoEmbed videoId="M7lc1UVf-VE" />
    </Wrapper>
  </div>
  <div class="tile autoscale">
    <div class="flex horizontal">
      <div class="tile resizable" />
      <div class="tile autoscale">
        <Wrapper {isResizing}>
          <Options />
        </Wrapper>
      </div>
    </div>
  </div>
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
    width: 50%;
    height: 100%;
  }
  .horizontal > .resizable {
    height: 50%;
    width: 100%;
  }
  .autoscale {
    flex: 1;
  }
  .tile {
    background-color: #2c2c2c;
    /* border: 5px solid blue; */
    display: flex;
    overflow: auto;
    left: 0px !important;
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
</style>
