<script lang="ts">
  import type { Writable } from 'svelte/store';

  interface RadioItem { value: string | boolean, label: string }

  /** Writable store for value updates. */
  export let store: Writable<string | boolean>;
  /** Radio button group items. */
  export let items: RadioItem[] = [];
  /** Map to generate items with. Will overwrite `items` prop. */
  export let map: Map<string | boolean, string> | null = null;
  /** Vertical variant. */
  export let vertical = false;

  const mapToRadioItem = (map: Map<string | boolean, string>) => {
    const items = [];
    for (const [key, value] of map) {
      items.push({ value: key, label: value });
    }
    return items;
  };

  function updateStore(value: string | boolean) {
    if (value === $store) return;
    $store = value;
  }

  $: if (map) {
    items = mapToRadioItem(map);
  }
</script>

<div class="flex {vertical ? 'flex-col' : 'gap-3 flex-wrap'}">
  {#each items as item}
    <label class="inline-flex items-center cursor-pointer gap-2">
      <input type="radio" checked={$store === item.value} on:change={() => updateStore(item.value)} />
      <span>{item.label}</span>
    </label>
  {/each}
</div>
