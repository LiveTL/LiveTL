<script>
  import { Button, Icon } from "svelte-materialify";
  import { lastVersion } from "../js/store.js";
  import Dialog from "./Dialog.svelte";

  const manifest = chrome.runtime.getManifest();
  let active = $lastVersion !== manifest.version;
</script>

<Dialog bind:active>
  <h1>New Update!</h1>
  <h2>LiveTL was updated to the newest version ({manifest.version}).</h2>
  <Button size="default" class="blue">See What's New!</Button>
</Dialog>

<style>
  h1 {
    font-size: 1.5rem;
  }
  h2 {
    font-size: 1rem;
  }
</style>
