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
  :global(html body) {
    height: auto !important;
  }
</style>
