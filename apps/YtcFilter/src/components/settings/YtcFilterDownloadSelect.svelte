<script lang="ts">
  import { exioRadio } from 'exio/svelte';
  import { exportMode } from '../../ts/storage';
  let txtExport: HTMLInputElement | null = null;
  const update = () => {
    $exportMode = txtExport?.checked ? 'txt' : 'json';
  };
  $exportMode = 'txt';
</script>

<div class="aligned-radios">
  <div class="export-radio">
    <input
      type="radio"
      id="export-txt"
      name="export-mode"
      value="txt"
      use:exioRadio
      group="export-mode"
      checked
      bind:this={txtExport}
      on:change={update}
    />
  </div>
  <label for="export-txt">.txt file</label>
</div>

<div class="aligned-radios">
  <div class="export-radio">
    <input
      type="radio"
      id="export-json"
      name="export-mode"
      value="json"
      use:exioRadio
      group="export-mode"
      on:change={update}
    />
  </div>
  <label for="export-json">.json dump file</label>
</div>

<style>
  .aligned-radios {
    display: flex;
    align-items: center;
  }
  .export-radio {
    margin-right: 0.5rem;
  }
</style>
