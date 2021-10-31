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

  onMount(async () => {
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

<div class="fixed z-50">
  <Dialog
    bind:active
    class="max-w-lg m-5 rounded-md"
    bgColor="bg-white dark:bg-dark-700"
  >
    <div slot="title" class="text-center">
      <h5>New Update!</h5>
      <h6>Here's what's new in LiveTL version {version}:</h6>
    </div>
    <div class="text-base">
      <Changelog bind:version />
      <h6 class="text-center">
        If you like this update, please consider sharing this information with
        your friends! We'd really appreciate it :)
      </h6>
    </div>
    <div class="text-center pt-4">
      <Button on:click={setLastVersion}>Let's Go!</Button>
    </div>
  </Dialog>
</div>
