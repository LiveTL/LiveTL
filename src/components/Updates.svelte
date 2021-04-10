<script>
  import { Button } from "svelte-materialify";
  import { onMount } from "svelte";
  import { lastVersion } from "../js/store.js";
  import Dialog from "./Dialog.svelte";

  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;
  let active = $lastVersion !== version;
  // let subelements = true;

  let Changelogs;
  onMount(async () => {
    Changelogs = (await import(`../changelogs/${version}.svelte`)).default;
  });
  let dialog;
  $: if (dialog) {
    dialog
      .querySelector(".s-overlay")
      .addEventListener("click", () => (active = false));
    // dialog.querySelectorAll(".s-expansion-panel__header").forEach(e => {
    //   e.addEventListener("mousedown", () => (subelements = false));
    // });
  }
</script>

<div bind:this={dialog}>
  <Dialog bind:active>
    <span class="centered">
      <h1>New Update!</h1>
      <h2>Here's what's new in LiveTL version {version}:</h2>
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
</div>

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
