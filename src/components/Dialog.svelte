<script>
  import { Button, Dialog, Icon } from "svelte-materialify";
  import { mdiClose } from "@mdi/js";
  import { lastVersion } from "../js/store.js";

  export let active = true;
  const close = () => {
    active = false;
  };
  let wrapper = null;
  let display = true;
  $: if (wrapper) {
    wrapper.addEventListener("transitionend", e => {
      if (e.target == wrapper && e.target.style.opacity == "0") {
        display = false;
      }
    });
  }
  $: if (active && wrapper) {
    display = true;
  }
</script>

<div
  class="s-dialog"
  style="
    opacity: {active ? 1 : 0};
    display: {display
    ? 'block'
    : 'none'};
  "
  bind:this={wrapper}
>
  <Dialog class="pa-4 wideDialog text-center" active>
    <div>
      <div class="closeWrap">
        <Button fab size="small" on:click={close}>
          <Icon path={mdiClose} />
        </Button>
      </div>
      <slot />
    </div>
  </Dialog>
</div>

<style>
  :global(.s-dialog) {
    z-index: 1000;
    font-size: 1rem;
  }
  :global(.s-dialog *) {
    line-height: 2rem;
  }
  :global(.wideDialog) {
    min-width: min(500px, 100%);
  }
  :global(.wideDialog button) {
    margin: 10px;
  }
  .closeWrap :global(*) {
    margin: 0;
  }
  .closeWrap {
    float: right;
  }
  :global(.s-expansion-panel > button) {
    line-height: 0px;
    margin: 0px;
  }
</style>
