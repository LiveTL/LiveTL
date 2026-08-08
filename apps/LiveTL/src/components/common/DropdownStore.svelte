<script lang="ts">
  import type { Writable } from 'svelte/store';

  type DropdownItem = { value: string, text: string } | string;

  /** Dropdown label. */
  export let name = '';
  /** Writable store for value updates. */
  export let store: Writable<string>;
  /** Dropdown items. */
  export let items: DropdownItem[] = [];
  /** Dense variant. */
  export let dense = false;
  /** Parent div used to determine top/bottom */
  export let boundingDiv: HTMLElement | null = null;

  $: value = $store;
  $: store.set(value);

</script>

<label class="flex flex-col {$$props.class ?? ''}">
  {#if name}<span class="text-xs text-gray-600 dark:text-gray-300">{name}</span>{/if}
  <select bind:value class="rounded bg-white dark:bg-dark-500 text-gray-800 dark:text-gray-100 {dense ? 'p-1' : 'p-2'}">
    {#each items as item}
      <option value={typeof item === 'string' ? item : item.value}>{typeof item === 'string' ? item : item.text}</option>
    {/each}
  </select>
</label>
