<script lang="ts">
  import { isLiveTL } from '../ts/chat-constants';
  import { exioButton, exioIcon } from 'exio/svelte';
  import { onDestroy, onMount } from 'svelte';
  import { embedHeight } from '../ts/storage';
  // @ts-expect-error vite inline css import
  import inline from '../stylesheets/ui.css?inline';
  const logo = chrome.runtime.getURL((isLiveTL ? 'ytcfilter' : 'assets') + '/logo-48.png');
  let dark = document.documentElement.hasAttribute('dark');
  let attrObserver: MutationObserver;
  let resizing = false;
  let touchOrigin: { x: number, y: number } | null = null;
  let windowHeight = window.innerHeight;
  let height = 0.75 * windowHeight;
  let loaded = false;
  // TODO FIX RESIZE SAVING
  onMount(async () => {
    await embedHeight.ready();
    const styleElem = document.createElement('style');
    styleElem.innerHTML = inline;
    document.head.appendChild(styleElem);
    if ($embedHeight !== null) {
      height = $embedHeight * windowHeight;
    }
    attrObserver = new MutationObserver((_) => {
      dark = document.documentElement.hasAttribute('dark');
    });
    attrObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['dark'] });
    const resizeMouse = (e: MouseEvent) => {
      height = e.y - ytcfIframe.getBoundingClientRect().top;
    };
    const resizeTouch = (e: TouchEvent) => {
      height = e.touches[0].clientY - ytcfIframe.getBoundingClientRect().top;
    };
    resizeBar.addEventListener('mousedown', (e) => {
      e.preventDefault();
      resizing = true;
      document.addEventListener('mousemove', resizeMouse);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', resizeMouse);
        resizing = false;
      });
    });
    resizeBar.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchOrigin = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      resizing = true;
      document.addEventListener('touchmove', resizeTouch);
      document.addEventListener('touchend', () => {
        document.removeEventListener('touchmove', resizeTouch);
        resizing = false;
      });
    });
    window.addEventListener('resize', () => {
      windowHeight = window.innerHeight;
    });
    loaded = true;
  });
  onDestroy(() => {
    attrObserver.disconnect();
  });
  let resizeBar: HTMLDivElement;
  // eslint-disable-next-line prefer-const
  let buttons: HTMLDivElement;
  let ytcfIframe: HTMLDivElement;
  let pxHeight = 0;
  $: if (loaded) {
    pxHeight = Math.min(
      windowHeight - 10 -
        (buttons ? buttons.getBoundingClientRect().top : 0) -
        (buttons ? buttons.clientHeight : 0),
      Math.max(height, 0)
    );
  }
  let calcHeight = '';
  $: tickEmbedHeight = $embedHeight;
  $: if (loaded && !resizing) {
    tickEmbedHeight = Math.max(0, Math.min(1, pxHeight / windowHeight));
    setTimeout(() => {
      $embedHeight = tickEmbedHeight;
    }, 100);
  }
  $: if (loaded) {
    let nextEmbedHeight = tickEmbedHeight;
    if (!nextEmbedHeight) {
      nextEmbedHeight = 0;
    }
    calcHeight = resizing ? `${pxHeight}px` : `${100 * nextEmbedHeight}vh`;
  }
  $: if (loaded) toggleMouse(resizing);
  function toggleMouse(toggle: boolean) {
    const elem = document.querySelector('#hyperchat');
    if (elem) {
      elem.style.pointerEvents = toggle ? 'none' : 'auto';
      elem.style.touchAction = toggle ? 'none' : 'auto';
    }
  }
</script>

<div data-theme={dark ? 'dark' : 'light'} class="ytcf-wrapper">
  <div class="ytcf-button-wrapper" bind:this={buttons}>
    <div class="static-logo">
      <img src={logo} alt="logo" class="logo"/>
      <span class="static-logo-text">YtcFilter</span>
    </div>
    <button use:exioButton class="activator ytcf-launch-button">
      <span class="activator-text">Embed</span>
      <div use:exioIcon class="shifted-icon top-bar-icon activator-icon">
        expand
      </div>
    </button>
    <button use:exioButton class="activator ytcf-popout-button">
      <span>Popout</span>
      <div use:exioIcon class="shifted-icon top-bar-icon">
        open_in_new
      </div>
    </button>
    <button use:exioButton class="activator ytcf-settings-button">
      <span>Settings</span>
      <div use:exioIcon class="shifted-icon top-bar-icon">
        settings
      </div>
    </button>
  </div>
  <div
    style="
      width: 100%;
      height: {calcHeight};
      pointer-events: {resizing ? 'none' : 'unset'};
      touch-action: {resizing ? 'none' : 'unset'};
      display: none;
    "
    class="ytcf-iframe"
    bind:this={ytcfIframe}
  />
  <div class="ytcf-resize-bar" style="display: none;" bind:this={resizeBar}>
    <span use:exioIcon style="font-size: 2rem;">drag_handle</span>
  </div>
</div>
<style>
  .ytcf-wrapper {
    user-select: none;
    white-space: nowrap;
  }
  .ytcf-resize-bar {
    width: 100%;
    height: 10px;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    cursor: row-resize;
    user-select: none;
    position: relative;
    justify-content: center;
    background-color: rgb(128 128 128 / 30%);
  }
  .static-logo {
    padding: 0.25em 0.5em;
    border: 2px solid transparent;
    cursor: pointer;
    pointer-events: none;
    user-select: none;
    touch-action: none;
    width: 100%;
    text-align: center;
  }
  @media (max-width: 350px) {
    .static-logo-text {
      display: none;
    }
    .ytcf-button-wrapper {
      display: grid !important;
      grid-template-columns: auto 1fr 1fr 1fr;
    }
    .static-logo {
      width: auto !important;
    }
  }
  .ytcf-button-wrapper {
    display: flex;
    align-content: space-between;
    justify-content: space-around;
  }
  .activator {
    background-color: transparent;
    width: 100%;
    color: inherit;
  }
  .logo {
    width: 15px;
    height: 15px;
    transform: translateY(2.5px);
  }
  .ytcf-wrapper[data-theme=dark] {
    color: white;
  }
  .ytcf-wrapper[data-theme=light] {
    color: black;
  }
  :global(:not([dark]) .content-pages) {
    background-color: white;
  }
  .top-bar-icon {
    color: #3ba7ff;
  }
</style>
