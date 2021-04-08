<script>
  import "../css/splash.css";
  import * as j from "jquery";
  import "jquery-ui-bundle";
  import "jquery-ui-bundle/jquery-ui.css";
  export let text = `
  Captions captured from the chat will appear here. Try moving and resizing!
  You can also disable floating captions in the settings menu.
  `;
  import { onMount } from "svelte";
  import { captionLeft, captionTop, captionWidth } from "../js/store.js";
  let captionElem = null;
  onMount(() => {
    const jcap = j(captionElem);
    jcap.draggable({
      stop: (event, ui) => {
        const top = captionElem.offsetTop;
        const left = captionElem.offsetLeft;
        const height = window.innerHeight;
        const width = window.innerWidth;
        const topPercent = (100 * top) / height;
        const leftPercent = (100 * left) / width;
        captionTop.set(topPercent);
        captionLeft.set(leftPercent);
      },
      containment: document.body
    });
    jcap.resizable({
      handles: "e, w",
      stop: (event, ui) => {
        const width = captionElem.clientWidth;
        const widthPercent = (100 * width) / window.innerWidth;
        captionWidth.set(widthPercent);
      }
    });
  });
</script>

<div
  id="ltlcaptions"
  bind:this={captionElem}
  style="
  top: {$captionTop}%;
  left: {$captionLeft}%;
"
>
  <div class="captionSegment">{text}</div>
</div>

<style>
  #ltlcaptions {
    z-index: 99999;
    padding: 5px 10px;
    animation-iteration-count: 1;
    animation: splash 1s normal forwards ease-in-out;
    position: absolute;
    cursor: move;
  }

  .captionSegment {
    color: #e5e5e5;
    word-wrap: break-word;
    word-break: break-word;
    font-size: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    margin: 0;
    padding: 5px 10px;
    animation-iteration-count: 1;
    animation: splash 1s normal forwards ease-in-out;
  }
</style>
