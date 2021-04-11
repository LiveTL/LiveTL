<script>
  import { MaterialApp } from "svelte-materialify/src";
  import Settings from "./Settings.svelte";

  export let name;
</script>

<div class="wrapper">
  <MaterialApp theme="dark">
    <Settings />
  </MaterialApp>
</div>

<style>
  .app {
    padding: 20px !important;
    display: grid;
    justify-content: center;
  }
</style>