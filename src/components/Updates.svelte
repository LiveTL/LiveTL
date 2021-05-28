<script>
  import { Button } from 'svelte-materialify';
  import { onMount, onDestroy } from 'svelte';
  import { lastVersion } from '../js/store.js';
  import Dialog from './Dialog.svelte';
  import versionMap from '../changelogs/versionMap';

  const manifest = window.chrome.runtime.getManifest();
  const version = versionMap(manifest.version);
  const lvLoaded = lastVersion.loaded;

  export let active = false;

  function setLastVersion() {
    active = false;
  }

  let Changelogs;
  let unsubscribe;

  onMount(async () => {
    Changelogs = (await import(`../changelogs/${version}.svelte`)).default;

    unsubscribe = lastVersion.subscribe($lv => {
      if ($lv != version) {
        active = true;
      }
      lastVersion.set(version);
    });
  });

  onDestroy(() => unsubscribe());
</script>

<div>
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
    <Button transition size="default" class="blue" on:click={setLastVersion}>
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
  .left :global(*) {
    text-align: left;
  }

</style>
