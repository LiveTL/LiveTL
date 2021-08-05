<script>
  import '../css/splash.css';
  import * as j from 'jquery';
  import 'jquery-ui-bundle';
  import 'jquery-ui-bundle/jquery-ui.css';
  import {
    captionLeft,
    captionTop,
    captionWidth,
    captionFontSize,
    enableCaptionTimeout,
    captionDuration
  } from '../js/store.js';
  export let text = `
  Captions captured from the chat will appear here. Try moving and resizing!
  You can also disable floating captions or make captions disappear
  when inactive in the settings menu.
  `;
  import { sources } from '../js/sources.js';
  let captionElem = null;
  const { translations } = sources;

  function stop() {
    const width = captionElem.clientWidth;
    const widthPercent = (100 * width) / window.innerWidth;
    captionWidth.set(widthPercent);
    const top = captionElem.offsetTop;
    const left = captionElem.offsetLeft;
    const height = window.innerHeight;
    const topPercent = (100 * top) / height;
    const leftPercent = (100 * left) / window.innerWidth;
    captionTop.set(topPercent);
    captionLeft.set(leftPercent);
  }

  $: if (captionElem) {
    setTimeout(() => {
      const jcap = j(captionElem);
      jcap.draggable({
        stop,
        containment: document.body
      });
      jcap.resizable({
        handles: 'e, w',
        resize: stop
      });
    }, 0);
  }

  let show = true;
  let timeout = setTimeout(() => {}, 0);

  function captionTimeout() {
    clearTimeout(timeout);
    timeout = setTimeout(() => (show = false), $captionDuration * 1000);
    show = true;
  }

  $: if ($enableCaptionTimeout && $captionFontSize) {
    captionTimeout();
  } else {
    show = true;
    clearTimeout(timeout);
  }

  $: if ($translations) {
    if ($enableCaptionTimeout) captionTimeout();
    if (elem) {
      elem.style.display = 'none';
      elem.offsetWidth; // force reflow
      elem.style.display = 'block';
    }
  }
  let elem = null;

  // Prevent null translations from resetting captions
  let captionText = text;
  $: if ($translations) {
    captionText = $translations.text;
  }
</script>

<div
  class="captionsBox"
  bind:this={captionElem}
  style="
  top: min(max({$captionTop}%, calc(0% - 20px)), calc(100% - 30px));
  left: min(max({$captionLeft}%, calc(0% - 20px)), calc(100% - 30px));
  width: max(0%, {$captionWidth}%);
  font-size: {$captionFontSize}px;
  display: {show
    ? 'block'
    : 'none'};
"
>
  <div class="captionSegment" bind:this={elem}>
    {captionText}
  </div>
</div>

<style>
  .captionsBox {
    z-index: 150;
    animation-iteration-count: 1;
    position: absolute;
    cursor: move;
    min-width: 50px;
    text-align: center;
  }

  .captionSegment {
    color: #e5e5e5;
    word-wrap: break-word;
    word-break: break-word;
    background-color: rgba(0, 0, 0, 0.8);
    margin: 0px 20px 0px 20px;
    padding: 5px 10px;
    animation-iteration-count: 1;
    animation: splash 1s normal forwards ease-in-out;
    margin: 20px;
    backdrop-filter: blur(5px);
  }
  .captionsBox :global(.ui-resizable-handle) {
    height: calc(100% - 40px);
    margin-top: 20px;
  }
  .captionsBox :global(.ui-resizable-e) {
    transform: translateX(-10px);
  }
  .captionsBox :global(.ui-resizable-w) {
    transform: translateX(10px);
  }
</style>
