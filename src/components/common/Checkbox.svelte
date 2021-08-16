<script lang="ts">
  import { Checkbox, SelectionLabel } from 'smelte';

  // eslint-disable-next-line no-undef
  type T = $$Generic;

  export let value: T | undefined;
  export let group: T[] = [];
  export let label = '';
  export let disabled = false;
  export let checked = false;
  export let wrapperClass = '';

  $: if (value != null) {
    checked = group.indexOf(value) >= 0;
  }

  function groupUpdate () {
    if (value == null) return;

    const i = group.indexOf(value);
    if (i < 0) {
      group.push(value);
    } else {
      group.splice(i, 1);
    }
    group = group;
  }

  const classes = 'inline-flex items-center cursor-pointer z-10';
</script>

<Checkbox
  class={wrapperClass}
  {classes}
  bind:checked
  {disabled}
  on:change={groupUpdate}
>
  <div slot="label">
    {#if label !== ''}
      <SelectionLabel slot="label" {disabled} {label} />
    {/if}
  </div>
</Checkbox>
