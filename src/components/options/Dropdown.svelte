<script>
  import { Select } from 'svelte-materialify/src';

  export let name = '';
  export let store = null;
  export let items = [];
  export let active = false;

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

<Select bind:value {items} solo bind:active>{name}</Select>
