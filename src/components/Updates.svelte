<script>
  import { onMount, onDestroy } from 'svelte';
  import { lastVersion } from '../js/store.js';
  import versionMap from '../changelogs/versionMap';
  import Dialog from './common/Dialog.svelte';
  import Button from 'smelte/src/components/Button';

  const manifest = window.chrome.runtime.getManifest();
  const version = versionMap(manifest.version);

  export let active = false;

  function setLastVersion() {
    active = false;
  }

  let Changelogs;
  let unsubscribe = () => { };

  onMount(async() => {
    Changelogs = (await import(`../changelogs/${version}.svelte`)).default;

    await lastVersion.loaded;

    unsubscribe = lastVersion.subscribe($lv => {
      if ($lv !== version) {
        active = true;
      }
      lastVersion.set(version);
    });
  });

  onDestroy(() => unsubscribe());
</script>

<Dialog bind:value={active} class="max-w-lg m-5 z-50 rounded-lg">
  <div slot="title" class="text-center">
    <h5>New Update!</h5>
    <h6>Here's what's new in LiveTL version {version}:</h6>
  </div>
  <div>
    <svelte:component this={Changelogs} />
    <h6 class="text-center">
      If you like this update, please consider sharing this information with
      your friends! We'd really appreciate it :)
    </h6>
  </div>
  <Button slot="actions" on:click={setLastVersion}>Let's Go!</Button>
</Dialog>
