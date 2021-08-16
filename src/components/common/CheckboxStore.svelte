<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Checkbox from './Checkbox.svelte';

  export let name = '';
  export let store: Writable<boolean>;

  $: value = $store;
  $: store.set(value);
</script>

<Checkbox bind:checked={value} label={name} />
