<script>
  import { Radio } from "svelte-materialify/src";

  export let name = "";
  export let options = [];
  export let store = null;
  export let color = "blue";

  function transformOpt(str) {
    return str
      .trim()
      .toLowerCase()
      .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
  }

  $: group = $store;
  $: store.set(group);
</script>

<div class="container d-flex justify-space-around">
  <span class="option-label">{name}</span>
  {#each options as opt}
    <Radio bind:group value={opt} {color}>{transformOpt(opt)}</Radio>
  {/each}
</div>

<style>
  /* TODO figure out what the actual name of label class is */
  :global(.s-radio label) {
    height: 20px;
    line-height: 20px;
    white-space: nowrap;
    margin-right: 12px;
    color: var(--theme-text-secondary);
    padding-left: 2px;
  }

  :global(.s-radio) {
    margin-left: 16px;
  }

  .container {
    padding-bottom: 10px;
  }
</style>
