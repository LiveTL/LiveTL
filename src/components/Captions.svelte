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
  import { captionText } from '../js/sources-aggregate.js';

  let captionElem = null;

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

  let elem = null;

  $: if ($captionText) {
    if ($enableCaptionTimeout) captionTimeout();
    if (elem) {
      elem.style.display = 'none';
      // eslint-disable-next-line no-unused-expressions
      elem.offsetWidth; // force reflow
      elem.style.display = 'block';
    }
  }
</script>

<div
  class="captionsBox z-40 absolute cursor-move text-center"
  style="
  top: min(max({$captionTop}%, calc(0% - 20px)), calc(100% - 30px));
  left: min(max({$captionLeft}%, calc(0% - 20px)), calc(100% - 30px));
  width: max(0%, {$captionWidth}%);
  font-size: {$captionFontSize}px;
  display: {show ? 'block' : 'none'};
"
  bind:this={captionElem}
>
  <div
    class="captionSegment break-words mx-5 py-1.5 px-2.5 bg-black bg-opacity-80 backdrop-filter backdrop-blur-sm"
    bind:this={elem}
  >
    {$captionText.text}
  </div>
</div>

<style>
  .captionsBox {
    animation-iteration-count: 1;
    min-width: 50px;
  }

  .captionSegment {
    animation-iteration-count: 1;
    animation: splash 1s normal forwards ease-in-out;
  }
  .captionsBox :global(.ui-resizable-handle) {
    height: 100%;
    position: absolute;
  }
  .captionsBox :global(.ui-resizable-e) {
    transform: translateX(-10px);
  }
  .captionsBox :global(.ui-resizable-w) {
    transform: translateX(10px);
  }
</style>
