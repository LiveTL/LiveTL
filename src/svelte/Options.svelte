<script>
  import { MaterialApp } from "svelte-materialify/src";

  import Settings from "./Settings.svelte";

  export let open = true;
</script>

<div class="wrapper">
  <MaterialApp theme="dark">
    <div class="app">
      {#if open}
        <Settings />
      {/if}
    </div>
    <slot />
  </MaterialApp>
</div>

<style>
  .wrapper {
    height: 100%;
    width: 100%;
  }
  :global(.s-app) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: fit-content;
    min-width: 100%;
  }

  .app {
    padding: 20px !important;
    display: grid;
    justify-content: center;
    min-width: max-content;
  }
  :global(body) {
    margin: 0px 0px;
    width: 100%;
    height: 100%;
    position: absolute;
  }
</style>
