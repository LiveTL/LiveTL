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

  $: if (captionElem) {
    setTimeout(() => {
      const jcap = j(captionElem);
      jcap.draggable({
        stop: () => {
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
        handles: 'e, w',
        stop: () => {
          const width = captionElem.clientWidth;
          const widthPercent = (100 * width) / window.innerWidth;
          captionWidth.set(widthPercent);
        }
      });
    }, 0);
  }

  let show = true;
  let timeout = setTimeout(() => {}, 0);
  $: if ($enableCaptionTimeout) {
    clearTimeout(timeout);
    timeout = setTimeout(() => (show = false), $captionDuration * 1000);
    show = true;
  }
</script>

<div
  class="captionsBox"
  bind:this={captionElem}
  style="
  top: {$captionTop}%;
  left: {$captionLeft}%;
  width: {$captionWidth}%;
  font-size: {$captionFontSize}px;
  display: {show
    ? 'block'
    : 'none'};
"
>
  <div class="captionSegment">{$translations ? $translations.text : text}</div>
</div>

<style>
  .captionsBox {
    z-index: 100;
    animation-iteration-count: 1;
    animation: splash 1s normal forwards ease-in-out;
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
    margin: 0;
    padding: 5px 10px;
    animation-iteration-count: 1;
    animation: splash 1s normal forwards ease-in-out;
  }
</style>
