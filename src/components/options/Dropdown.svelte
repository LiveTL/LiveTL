<script>
  import { Select } from 'svelte-materialify/src';

  export let name = '';
  export let store = null;
  export let items = [];
  export let active = false;
  export let label = '';
  let elem = null;
  
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

  $: if (label && elem) {
    setTimeout(() => {
      elem.querySelector('input').value = label || value;
    }, 0);
  }
</script>

<div bind:this={elem}>
  <Select bind:value {items} solo bind:active>{name}</Select>
</div>

<style>
  :global(.s-text-field__input) {
    display: flex;
    align-items: center;
  }
  :global(.s-text-field__input label) {
    top: unset !important;
  }
</style>
