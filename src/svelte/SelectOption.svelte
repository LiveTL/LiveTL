<script>
  import { Select } from 'svelte-materialify/src';

  export let name = '';
  export let store = null;
  export let items = [];

  function correctValue() {
    if ((typeof value) != 'string') {
      value = value[0];
    }
  }

  $: value = $store;
  $: store.set(typeof value == 'string' ? value : value[0]);
  $: correctValue(value);
</script>

<Select bind:value {items} solo>{name}</Select>