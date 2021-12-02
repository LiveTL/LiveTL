<script>
  import { version } from '../../package.json';
  import { onMount, onDestroy } from 'svelte';
  import { lastVersion, updatePopupActive } from '../js/store.js';
  import Dialog from './common/Dialog.svelte';
  import Button from 'smelte/src/components/Button';
  import Changelog from './changelog/Changelog.svelte';

  let unsubscribe = () => { };

  onMount(async () => {
    await Promise.all([lastVersion.loaded, updatePopupActive.loaded]);

    unsubscribe = lastVersion.subscribe($lv => {
      if ($lv !== version) {
        $updatePopupActive = true;
      }
      lastVersion.set(version);
    });
  });

  onDestroy(() => unsubscribe());

  function closeUpdate() {
    $updatePopupActive = false;
  }
</script>

<div class="fixed z-50">
  <Dialog
    bind:active={$updatePopupActive}
    class="max-w-lg m-5 rounded-md"
    bgColor="bg-white dark:bg-dark-700"
  >
    <div slot="title" class="text-center">
      <h5>New Update!</h5>
      <h6>Here's what's new in LiveTL version {version}:</h6>
    </div>
    <div class="text-base">
      <Changelog />
      <h6 class="text-center">
        If you like this update, please consider sharing this information with
        your friends! We'd really appreciate it :)
      </h6>
    </div>
    <div class="text-center pt-4">
      <Button on:click={closeUpdate}>Let's Go!</Button>
    </div>
  </Dialog>
</div>
