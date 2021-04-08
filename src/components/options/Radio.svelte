<script>
  import { Radio } from "svelte-materialify/src";

  export let name = "";
  export let options = [];
  export let store = null;
  export let color = "blue";

  const transformOpt = str =>
    str
      .trim()
      .toLowerCase()
      .replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase()));

  $: group = $store;
  $: store.set(group);
</script>

<div class="container">
  <span class="option-label">{name}</span>
  <div class="buttons d-flex">
    {#each options as opt}
      <Radio bind:group value={opt} {color}>{transformOpt(opt)}</Radio>
    {/each}
  </div>
</div>

<style>
  /* TODO figure out what the actual name of label class is */
  :global(.s-radio label) {
    height: 20px;
    line-height: 20px;
    white-space: nowrap;
    color: var(--theme-text-secondary);
    padding-left: 4px;
  }

  :global(.s-radio) {
    font-size: 16px !important;
    margin-left: 12px;
  }

  .container {
    padding-bottom: 10px;
    margin-left: 0px;
    padding-left: 0px;
  }

  .option-label {
    float: left;
  }
</style>
