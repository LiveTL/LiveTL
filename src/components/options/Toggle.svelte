<script>
  import { Checkbox } from 'svelte-materialify/src';
  export let name = '';
  export let store = null;
  export let disabled = false;

  $: value = $store;
  $: store.set(value);
</script>

<Checkbox bind:checked={value} {disabled} color="blue">
  <span class="option-label">{name}</span>
</Checkbox>
