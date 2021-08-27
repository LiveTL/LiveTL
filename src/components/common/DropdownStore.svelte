<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Select from 'smelte/src/components/Select';

  type DropdownItem = { value: string, text: string } | string;

  /** Dropdown label. */
  export let name = '';
  /** Writable store for value updates. */
  export let store: Writable<string>;
  /** Dropdown items. */
  export let items: DropdownItem[] = [];
  /** Dense variant. */
  export let dense = false;

  $: value = $store;
  $: store.set(value);

  const classes = 'cursor-pointer relative ' +
    ($$props.class ? $$props.class : '');
  const optionsClasses = 'absolute left-0 bg-white rounded shadow w-full ' +
    'z-20 dark:bg-dark-500 max-h-60 overflow-auto';
</script>

<Select
  bind:value
  label={name}
  {items}
  {classes}
  {dense}
  {optionsClasses}
/>
