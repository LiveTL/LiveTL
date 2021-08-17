<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { Select } from 'smelte';

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

  const classes = 'cursor-pointer relative';
</script>

<Select
  bind:value
  label={name}
  {items}
  {classes}
  {dense}
/>
