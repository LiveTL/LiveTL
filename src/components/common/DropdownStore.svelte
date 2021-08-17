<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { Select } from 'smelte';

  type DropdownItem = ({value:string, text: string}|string);

  export let name = '';
  export let store: Writable<string>;
  export let items: DropdownItem[] = [];
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
