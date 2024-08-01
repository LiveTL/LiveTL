<script>
  import pkg from '../../package.json';
  import { onMount } from 'svelte';
  import { lastVersion, updatePopupActive } from '../js/store.js';
  import Dialog from './common/Dialog.svelte';
  import Button from 'smelte/src/components/Button';
  import Changelog from './changelog/Changelog.svelte';

  const version = pkg.version;

  /** @type {string | null} */
  let updateAvailableVersion = null;

  /** @type {(details: { version: string }) => void} */
  const handleUpdateAvailable = (details) => {
    updateAvailableVersion = details.version;
    $updatePopupActive = true;
  };

  const updateExtension = () => {
    updateAvailableVersion = null;
    $updatePopupActive = false;
    chrome.runtime.reload();
    console.log(chrome.runtime.reload);
  };

  onMount(async () => {
    await Promise.all([lastVersion.loaded, updatePopupActive.loaded]);

    return lastVersion.subscribe($lv => {
      if ($lv !== version) {
        $updatePopupActive = true;
      }
      lastVersion.set(version);
    });
  });

  onMount(() => {
    chrome.runtime.onUpdateAvailable.addListener(handleUpdateAvailable);
    return () => {
      chrome.runtime.onUpdateAvailable.removeListener(handleUpdateAvailable);
    };
  });

  function closeUpdate() {
    $updatePopupActive = false;
  }

  // reset when update dialog closed
  $: if (!$updatePopupActive) {
    updateAvailableVersion = null;
  }
  $: window.handleUpdateAvailable = handleUpdateAvailable;
</script>

<div class="fixed z-50">
  <Dialog
    bind:active={$updatePopupActive}
    class="max-w-lg m-5 rounded-md"
    bgColor="bg-white dark:bg-dark-700"
  >
    <div slot="title" class="text-center">
      {#if updateAvailableVersion === null}
        <h5>New Update!</h5>
        <h6>Here's what's new in LiveTL version {version}:</h6>
      {:else}
        <h5>New Update Available!</h5>
        <h6>v{version}</h6>
      {/if}
    </div>
    {#if updateAvailableVersion === null}
      <div class="text-base">
        <Changelog />
        <h6 class="text-center">
          If you like this update, please consider sharing this information with
          your friends! We'd really appreciate it :)
        </h6>
      </div>
      <div class="update-dialog text-center pt-4">
        <Button on:click={closeUpdate}>Let's Go!</Button>
      </div>
    {:else}
      <div class="update-dialog text-center pt-4">
        <Button on:click={updateExtension}>Update!</Button>
      </div>
    {/if}
  </Dialog>
</div>
