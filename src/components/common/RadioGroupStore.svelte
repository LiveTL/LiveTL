<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { RadioButtonGroup } from 'smelte';

  type RadioItem = { value: string, label: string };

  /** Writable store for value updates. */
  export let store: Writable<string>;
  /** Radio button group items. */
  export let items: RadioItem[] = [];
  /** Map to generate items with. Will overwrite `items` prop. */
  export let map: Map<string, string> | null = null;

  const mapToRadioItem = (map: Map<string, string>) => {
    const items = [];
    for (const [key, value] of map) {
      items.push({ value: key, label: value });
    }
    return items;
  };

  $: if (map) {
    items = mapToRadioItem(map);
  }
  $: selected = $store;
  $: store.set(selected);

  const classes = 'flex gap-3 flex-wrap';
  const buttonClasses = 'cursor-pointer z-0';
</script>

<RadioButtonGroup
  {classes}
  {items}
  bind:selected
  {buttonClasses}
/>
