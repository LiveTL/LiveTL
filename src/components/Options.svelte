<script>
  import { MaterialApp } from 'svelte-materialify/src';
  import Settings from './Settings.svelte';
  export let isStandalone = false;
  export let isResizing = false;
  export let active = false;

  // Hot reload window.mchad
  // TODO delete before pr
  import * as mchad from '../js/mchad.js';
  import { onMount } from 'svelte';

  onMount(() => {
    window.mchad = mchad;
  });
</script>

<MaterialApp theme="dark">
  <div class="wrapper">
    <div class="app">
      <Settings {isStandalone} {isResizing} bind:active />
    </div>
    <slot />
  </div>
</MaterialApp>

<style>
  .wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .app {
    padding: 0px !important;
    justify-content: center;
    height: 100%;
  }
  :global(body) {
    margin: 0px 0px;
    width: 100%;
    height: 100%;
    position: absolute;
  }

</style>
