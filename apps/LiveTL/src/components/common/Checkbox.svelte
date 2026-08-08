<script lang="ts">
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

</script>

<label class="inline-flex items-center cursor-pointer {wrapperClass}" class:opacity-50={disabled}>
  <input type="checkbox" bind:checked {disabled} on:change={groupUpdate} />
  {#if label !== ''}<span class="pl-2 text-gray-700 dark:text-gray-300">{label}</span>{/if}
</label>
