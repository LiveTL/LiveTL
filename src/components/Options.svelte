<script>
  import { MaterialApp } from 'svelte-materialify/src';
  import Settings from './Settings.svelte';
  export let isStandalone = false;
</script>

<MaterialApp theme="dark">
  <div class="wrapper">
    <div class="app">
      <Settings {isStandalone} />
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
    min-width: max-content;
    max-height: 100%;
  }
  :global(body) {
    margin: 0px 0px;
    width: 100%;
    height: 100%;
    position: absolute;
  }
</style>
