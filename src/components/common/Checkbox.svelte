<script lang="ts">
  import { Checkbox, SelectionLabel } from 'smelte';

  export let label = '';
  export let disabled = false;
  export let checked = false;

  const classes = 'inline-flex items-center cursor-pointer z-10';
</script>

<Checkbox {classes} bind:checked {disabled}>
  <div slot="label">
    {#if label !== ''}
      <SelectionLabel slot="label" {disabled} {label} />
    {/if}
  </div>
</Checkbox>
