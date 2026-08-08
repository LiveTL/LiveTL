<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Checkbox from './Checkbox.svelte';

  /** Checkbox label. */
  export let name = '';
  /** Writable store for value updates. */
  export let store: Writable<boolean>;
  /** Checkbox disabled state. */
  export let disabled = false;

  function updateStore(value: boolean) {
    if (value === $store) return;
    $store = value;
  }

  $: value = $store;
  $: updateStore(value);
</script>

<Checkbox bind:checked={value} label={name} {disabled} />
