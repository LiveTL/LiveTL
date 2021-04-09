<script>
  import {
    Button,
    Dialog,
    Card,
    CardText,
    CardTitle,
    CardActions,
    Icon,
    MaterialApp
  } from "svelte-materialify";
  import { mdiClose } from "@mdi/js";
  import { lastVersion } from "../js/store.js";

  const manifest = chrome.runtime.getManifest();
  let active = $lastVersion !== manifest.version;
  const close = () => {
    active = false;
    // TODO uncomment to only show on update
    // lastVersion.set(manifest.version);
  };
  let wrapper = null;
  $: if (wrapper) {
    wrapper.addEventListener("transitionend", e => {
      if (e.target == wrapper) {
        wrapper.remove();
      }
    });
  }
</script>

<div class="s-dialog" style="
  opacity: {active ? 1 : 0};
" bind:this={wrapper}>
  <Dialog class="pa-4 wideDialog text-center" bind:active>
    <div>
      <div class="closeWrap">
        <Button fab size="small" on:click={close}>
          <Icon path={mdiClose} />
        </Button>
      </div>
      <h1>New Update!</h1>
      <h2>LiveTL was updated to the newest version ({manifest.version}).</h2>
      <Button size="default" class="blue">See What's New!</Button>
    </div>
  </Dialog>
</div>

<style>
  :global(.s-dialog) {
    z-index: 1000;
  }
  :global(.s-dialog) * {
    line-height: 2rem;
  }
  :global(.wideDialog) {
    min-width: min(500px, 100%);
  }
  :global(.wideDialog button) {
    margin: 10px;
  }
  h1 {
    font-size: 1.5rem;
  }
  h2 {
    font-size: 1rem;
  }
  .closeWrap :global(*) {
    margin: 0;
  }
  .closeWrap {
    float: right;
  }
</style>
