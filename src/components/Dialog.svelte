<script>
  import { Button, Dialog, Icon } from 'svelte-materialify';
  import { mdiClose } from '@mdi/js';

  export let active = true;
  const close = () => {
    active = false;
  };
  let wrapper = null;
  export let display = false;
  $: if (wrapper) {
    wrapper.addEventListener('transitionend', e => {
      if (e.target == wrapper && e.target.style.opacity == '0') {
        display = false;
      }
    });
    wrapper
      .querySelector('.s-overlay')
      .addEventListener('click', close);
  }
  $: if (active && wrapper) {
    display = true;
  }
</script>

<div
  class="s-dialog"
  style="
    opacity: {active ? 1 : 0};
    display: {display ? 'block' : 'none'};
  "
  bind:this={wrapper}
>
  <Dialog class="pa-4 wideDialog text-center" active persistent>
    <div>
      <div class="closeWrap">
        <slot name="buttons">
          <Button fab size="small" on:click={close}>
            <Icon path={mdiClose} />
          </Button>
        </slot>
      </div>
      <slot default />
    </div>
  </Dialog>
</div>

<style>
  .s-dialog {
    z-index: 1000;
    font-size: 1rem;
  }
  .s-dialog :global(*) {
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
