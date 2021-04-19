<script>
  import { ButtonGroup, ButtonGroupItem } from 'svelte-materialify/src';

  export let name = '';
  export let options = [];
  export let store = null;

  const transformOpt = str =>
    str
      .trim()
      .toLowerCase()
      .replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase()));

  let value = options.indexOf($store);
  $: store.set(options[value]);
</script>

<div class="container text-center">
  <span class="option-label">{name}</span>
  <ButtonGroup borderless mandatory tile activeClass="primary-color" bind:value style="width: 100%">
    {#each options as opt}
      <ButtonGroupItem>{transformOpt(opt)}</ButtonGroupItem>
    {/each}
  </ButtonGroup>
</div>

<style>
  .container {
    padding-bottom: 10px;
    margin-left: 0px;
    padding-left: 0px;
  }

  :global(.container button) {
    width: 50%;
  }

  .option-label {
    float: left;
  }
</style>
