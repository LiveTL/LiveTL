<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Checkbox from './Checkbox.svelte';

  /** Checkbox label. */
  export let name = '';
  /** Writable store for value updates. */
  export let store: Writable<boolean>;
  /** Checkbox disabled state. */
  export let disabled = false;

  $: value = $store;
  $: store.set(value);
</script>

<Checkbox bind:checked={value} label={name} {disabled} />
