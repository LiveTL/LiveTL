<script>
  import { Button } from "svelte-materialify";
  import { onMount } from "svelte";
  import { lastVersion } from "../js/store.js";
  import Dialog from "./Dialog.svelte";

  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;
  let active = $lastVersion !== version;

  let Changelogs;
  onMount(async () => {
    Changelogs = (await import(`../changelogs/${version}.svelte`)).default;
  });
</script>

<Dialog bind:active>
  <span class="centered">
    <h1>New Update!</h1>
    <h2>LiveTL was updated to the newest version ({version}).</h2>
  </span>
  <span class="left">
    <svelte:component this={Changelogs} />
  </span>
  <Button
    transition
    size="default"
    class="blue"
    on:click={() => (active = false)}
  >
    Let's Go!
  </Button>
</Dialog>

<style>
  h1 {
    font-size: 1.5rem;
  }
  h2 {
    font-size: 1rem;
  }
  * {
    text-align: left;
  }
  .centered * {
    text-align: center;
  }
  .left * {
    text-align: left;
  }
</style>
