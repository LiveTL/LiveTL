<script>
  import { Radio } from 'svelte-materialify/src';

  export let name = '';
  export let options = [];
  export let store = null;
  export let color = 'blue';

  function transformOpt(str) {
    return str.trim().toLowerCase().replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase()));
  }

  $: group = $store;
</script>

<div class="container d-flex justify-space-around">
  <span class="enum-label">{name}</span>
  {#each options as opt}
    <Radio bind:group value={opt} {color}>{transformOpt(opt)}</Radio>&nbsp;&nbsp;
  {/each}
</div>
<br />

<style>
  /* TODO figure out what the actual name of label class is */
  .enum-label {
    height: 20px;
    line-height: 20px;
    white-space: nowrap;
    margin-right: 12px;
    color: var(--theme-text-secondary);
    font-size: 16px;
  }

  .container {
    padding-bottom: 5px;
  }
</style>