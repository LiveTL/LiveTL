<script>
  import * as j from "jquery";
  import "jquery-ui-bundle";
  import "jquery-ui-bundle/jquery-ui.css";
  import Options from "./Options.svelte";
  import { videoSide } from "../js/store.js";
  import { VideoSide } from "../js/constants.js";
  window.j = j;
  function resizable(selector, info) {
    j(document.querySelector(selector)).resizable(info);
  }
  const changeSide = (side) => {
    document.querySelectorAll(".ui-resizable-handle").forEach((elem) => {
      elem.remove();
    });
    resizable(".vertical .resizable", {
      handles: $videoSide == VideoSide.RIGHT ? "w" : "e",
      start: () => {},
      stop: () => {},
      resize: (event, ui) => {},
      // containment: "body",
    });
    resizable(".vertical .autoscale .resizable", {
      handles: "s",
      start: () => {},
      stop: () => {},
      resize: (event, ui) => {},
      containment: "body",
    });
  };
  $: changeSide($videoSide);
  window.addEventListener("load", () => changeSide($videoSide));
</script>

<div class="flex vertical {$videoSide == VideoSide.RIGHT ? 'reversed' : ''}">
  <div class="tile resizable" />
  <div class="tile autoscale">
    <div class="flex horizontal">
      <div class="tile resizable" />
      <div class="tile autoscale">
        <Options />
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
    background-color: red;
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
    background-color: black;
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
