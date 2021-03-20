<script>
  import Settings from "./Settings.svelte";
</script>

<div class="wrapper">
  <div class="app">
    <Settings />
  </div>
  <slot />
</div>

<style>
  .wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .app {
    padding: 20px !important;
    display: grid;
    justify-content: center;
    min-width: max-content;
    max-height:100%;
  }
  :global(body) {
    margin: 0px 0px;
    width: 100%;
    height: 100%;
    position: absolute;
  }
</style>
