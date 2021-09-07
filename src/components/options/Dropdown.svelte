<script>
  import { Select } from 'svelte-materialify/src';
  import { windowSize } from '../../js/store.js';

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

  function windowResized(size) {
    if (elem) {
      const list = elem.querySelector('.s-menu');
      if (list) {
        const bounds = list.getBoundingClientRect();
        list.style.height = `${Math.min(bounds.height, size.height - bounds.y)}px`;
      }
    }
  }
  
  $: console.log(items);
  $: active, setTimeout(() => windowResized($windowSize), 0);
</script>

<div bind:this={elem} class="wrapped">
  <Select bind:value {items} solo bind:active>{name}</Select>
</div>

<style>
  .wrapped :global(.s-text-field__input) {
    display: flex;
    align-items: center;
  }
  .wrapped :global(.s-text-field__input label) {
    top: unset !important;
  }
</style>
