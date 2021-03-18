<script>
  import { MaterialApp } from "svelte-materialify";

  import Settings from "./Settings.svelte";
</script>

<div class="options">
  <MaterialApp>
    <Settings />
  </MaterialApp>
</div>

<style>
  .options {
    margin: 20px;
  }
  :global(body) {
    margin: 0px 0px;
    width: 100%;
    height: 100%;
    position: absolute;
  }
</style>
