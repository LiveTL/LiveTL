<script>
  import { Button } from "svelte-materialify";
  import { onMount, onDestroy } from "svelte";
  import { lastVersion } from "../js/store.js";
  import Dialog from "./Dialog.svelte";

  const manifest = window.chrome.runtime.getManifest();
  const version = manifest.version;
  const lvLoaded = lastVersion.loaded;

  export let active;

  const unsetLastVersion = () => {
    lastVersion.set(version);
    active = false;
  };

  let Changelogs;
  onMount(async () => {
    Changelogs = (await import(`../changelogs/${version}.svelte`)).default;
  });
  let dialog;
  $: if (dialog) {
    dialog
      .querySelector(".s-overlay")
      .addEventListener("click", () => unsetLastVersion());
  }

  $: active = $lvLoaded && $lastVersion != version;
  onDestroy(() => lastVersion.set(active ? $lastVersion : version));
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
    <span class="centered">
      <h2 style="margin: 25px;">
        If you like this update, please consider sharing this information with
        your friends! We'd really appreciate it :)
      </h2>
    </span>
    <Button
      transition
      size="default"
      class="blue"
      on:click={() => unsetLastVersion()}
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
