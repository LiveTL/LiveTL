<script lang="ts">
  import Checkbox, { Label } from 'smelte/src/components/Checkbox';

  // eslint-disable-next-line no-undef
  type T = $$Generic;

  /** Value of checkbox. See `group` prop. */
  export let value: T | null = null;
  /** For use with `bind:group`. Adds/Removes `value` prop in the bound array when checked state changes. */
  export let group: T[] = [];
  /** Checkbox label. */
  export let label = '';
  /** Checkbox disabed state. */
  export let disabled = false;
  /** Checkbox checked state. */
  export let checked = false;
  /** Classes of the internal Checkbox parent div. */
  export let wrapperClass = '';

  $: if (value != null) {
    checked = group.indexOf(value) >= 0;
  }

  function groupUpdate() {
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
  const labelClasses = 'decoration-clone pl-2 cursor-pointer text-gray-700 ' +
    'dark:text-gray-300';
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
      <Label slot="label" {disabled} {label} classes={labelClasses} />
    {/if}
  </div>
</Checkbox>
