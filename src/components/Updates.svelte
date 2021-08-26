<script>
  import { onMount, onDestroy } from 'svelte';
  import { lastVersion } from '../js/store.js';
  import Dialog from './common/Dialog.svelte';
  import Button from 'smelte/src/components/Button';
  import Changelog from './changelog/Changelog.svelte';

  let version = '';

  export let active = false;

  function setLastVersion() {
    active = false;
  }

  let unsubscribe = () => { };

  onMount(async() => {
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

<Dialog bind:active class="max-w-lg m-5 z-50 rounded-md">
  <div slot="title" class="text-center">
    <h5>New Update!</h5>
    <h6>Here's what's new in LiveTL version {version}:</h6>
  </div>
  <div>
    <Changelog bind:version />
    <h6 class="text-center">
      If you like this update, please consider sharing this information with
      your friends! We'd really appreciate it :)
    </h6>
  </div>
  <div class="text-center">
    <Button slot="actions" on:click={setLastVersion}>Let's Go!</Button>
  </div>
</Dialog>
