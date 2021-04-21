<script>
  import { Select } from 'svelte-materialify/src';

  export let name = '';
  export let store = null;
  export let items = [];

  function correctValue() {
    if (value == null) {
      value = $store;
    }
    if (typeof value != 'string') {
      value = value[0];
    }
  }

  $: value = $store;
  $: correctValue(value);
  $: store.set(value);
</script>

<Select bind:value {items} solo>{name}</Select>
