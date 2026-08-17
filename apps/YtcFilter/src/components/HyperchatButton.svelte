<script lang='ts'>
  import { isLiveTL } from '../ts/chat-constants';
  import { hcEnabled, lastOpenedVersion } from '../ts/storage';
  import { mdiChevronRight, mdiClose } from '@mdi/js';

  $: disabled = !$hcEnabled;

  const toggleHc = () => {
    $hcEnabled = !$hcEnabled;
    location.reload();
  };

  const logo = chrome.runtime.getURL((isLiveTL ? 'hyperchat' : 'assets') + '/logo-48.png');
  let updated = false;

  lastOpenedVersion.ready().then(() => {
    updated = !$hcEnabled && $lastOpenedVersion !== __VERSION__;
  });
</script>

<div id="hc-buttons">
  {#if updated}
    <div class="update-notification">
      Updated!
      <svg height="24" width="24" viewBox="0 0 24 24" class="chevron">
        <path d={mdiChevronRight} fill="black"/>
      </svg>
      <div style="cursor: pointer;" on:click={() => {
        updated = false;
        $lastOpenedVersion = __VERSION__;
      }}>
        <svg height="20" width="24" viewBox="0 0 24 24" class="close">
          <path d={mdiClose} fill="black"/>
        </svg>
      </div>
    </div>
  {/if}
  <div class="tooltip-bottom" data-tooltip="{disabled ? 'Enable' : 'Disable'} HyperChat">
    <div class="toggleButton" class:disabled on:click={toggleHc} >
      <img src={logo} alt="hc-logo"/>
      <span>HC</span>
    </div>
  </div>
</div>

<style>
  #hc-buttons {
    float: right;
    display: flex;
    user-select: none;
  }

  .toggleButton {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    margin: -2px 0;
    /* min-width: 64px; */
    height: 28px;
    text-align: center;
    text-overflow: ellipsis;
    text-transform: uppercase;
    color: #30acff;
    font-family: var(--pure-material-font, "Roboto", "Segoe UI", BlinkMacSystemFont, system-ui, -apple-system);
    font-size: 15px;
    font-weight: 500;
    overflow: hidden;
    outline: none;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }
  .toggleButton.disabled {
    color: var(--yt-live-chat-secondary-text-color);
  }

  .toggleButton img {
    width: 30px;
    height: 30px;
    margin: -3px 0;
    margin-right: 4px;
  }

  .toggleButton.disabled img {
    filter: saturate(0.8);
  }

  .toggleButton::-moz-focus-inner {
    border: none;
  }

  /* Overlay */
  .toggleButton::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgb(255, 255, 255);
    opacity: 0;
    transition: opacity 0.2s;
  }

  /* Hover, Focus */
  .toggleButton:hover,
  .toggleButton:focus {
    background: rgba(0, 0, 0, 0.1);
  }

  .toggleButton:hover img,
  .toggleButton:focus img {
    filter: saturate(0.8);
  }

  /* Ripple */
  .toggleButton::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    border-radius: 50%;
    padding: 50%;
    width: 32px; /* Safari */
    height: 32px; /* Safari */
    background-color: rgb(var(--pure-material-onprimary-rgb, 255, 255, 255));
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
    transition: opacity 1s, transform 0.5s;
  }

  .toggleButton:hover::before {
    opacity: 0.08;
  }

  .toggleButton:focus::before {
    opacity: 0.24;
  }

  .toggleButton:hover:focus::before {
    opacity: 0.3;
  }

  .toggleButton:active::after {
    opacity: 0.32;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0s;
  }

  /* Disabled */
  .toggleButton:disabled {
    color: rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.38);
    background-color: rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.12);
    box-shadow: none;
    cursor: initial;
  }

  .toggleButton:disabled::before {
    opacity: 0;
  }

  .toggleButton:disabled::after {
    opacity: 0;
  }

  :global(yt-live-chat-app) {
    min-height: 0px;
    min-width: 0px;
  }

  /**
    * Tooltip Styles (source: https://codepen.io/cbracco/pen/nufHz)
  */
  /* Base styles for the element that has a tooltip */
  [data-tooltip] {
    position: relative;
    cursor: pointer;
  }

  /* Base styles for the entire tooltip */
  [data-tooltip]:before,
  [data-tooltip]:after {
    position: absolute;
    visibility: hidden;
    opacity: 0;
    -webkit-transition:
      opacity 0.2s ease-in-out,
      visibility 0.2s ease-in-out,
      -webkit-transform 0.2s cubic-bezier(0.71, 1.7, 0.77, 1.24);
    -moz-transition:
      opacity 0.2s ease-in-out,
      visibility 0.2s ease-in-out,
      -moz-transform 0.2s cubic-bezier(0.71, 1.7, 0.77, 1.24);
    transition:
      opacity 0.2s ease-in-out,
      visibility 0.2s ease-in-out,
      transform 0.2s cubic-bezier(0.71, 1.7, 0.77, 1.24);
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform:    translate3d(0, 0, 0);
    transform:         translate3d(0, 0, 0);
    pointer-events: none;
  }

  /* Show the entire tooltip on hover and focus */
  [data-tooltip]:hover:before,
  [data-tooltip]:hover:after,
  [data-tooltip]:focus:before,
  [data-tooltip]:focus:after {
    visibility: visible;
    opacity: 1;
  }

  /* Base styles for the tooltip's directional arrow */
  [data-tooltip]:before {
    z-index: 1001;
    border: 6px solid transparent;
    background: transparent;
    content: "";
  }

  /* Base styles for the tooltip's content area */
  [data-tooltip]:after {
    text-align: center;
    z-index: 1000;
    padding: 8px;
    width: max-content;
    background-color: #000;
    background-color: hsla(0, 0%, 20%, 0.9);
    color: #fff;
    content: attr(data-tooltip);
    font-size: 14px;
    line-height: 1.2;
  }

  /* Directions */
  /* Top (default) */
  [data-tooltip]:before,
  [data-tooltip]:after {
    bottom: 100%;
    left: 50%;
  }

  [data-tooltip]:before {
    margin-left: -6px;
    margin-bottom: -12px;
    border-top-color: #000;
    border-top-color: hsla(0, 0%, 20%, 0.9);
  }

  /* Horizontally align top/bottom tooltips */
  [data-tooltip]:after {
    margin-left: -80px;
  }

  [data-tooltip]:hover:before,
  [data-tooltip]:hover:after,
  [data-tooltip]:focus:before,
  [data-tooltip]:focus:after {
    -webkit-transform: translateY(-12px);
    -moz-transform:    translateY(-12px);
    transform:         translateY(-12px);
  }

  /* Bottom */
  .tooltip-bottom:before,
  .tooltip-bottom:after {
    top: 100%;
    bottom: auto;
    left: 50%;
  }

  .tooltip-bottom:before {
    margin-top: -12px;
    margin-bottom: 0;
    border-top-color: transparent;
    border-bottom-color: #000;
    border-bottom-color: hsla(0, 0%, 20%, 0.9);
  }

  .tooltip-bottom:hover:before,
  .tooltip-bottom:hover:after,
  .tooltip-bottom:focus:before,
  .tooltip-bottom:focus:after {
    -webkit-transform: translateY(12px);
    -moz-transform:    translateY(12px);
    transform:         translateY(12px);
  }

  .update-notification {
    background-color: rgb(224, 172, 0);
    color: black;
    display: flex;
    border-radius: 1000px;
    padding-left: 10px;
    font-size: 1.5rem;
    justify-content: center;
    align-items: center;
  }
  .close {
    display: none;
  }
  .update-notification:hover .chevron {
    display: none;
  }
  .update-notification:hover .close {
    display: block;
  }
</style>
