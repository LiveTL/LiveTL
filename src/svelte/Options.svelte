<script>
  import { MaterialApp } from "svelte-materialify";

  import Settings from "./Settings.svelte";
</script>

<div class="wrapper">
  <MaterialApp theme="dark">
    <div class="app">
      <Settings />
    </div>
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
  }

  .app {
    padding: 20px !important;
    display: grid;
    justify-content: center;
  }
  :global(body) {
    margin: 0px 0px;
    width: 100%;
    height: 100%;
    position: absolute;
  }
</style>
