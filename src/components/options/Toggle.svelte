<script>
  import { Checkbox } from 'svelte-materialify/src';
  export let name = '';
  export let store = null;

  $: value = $store;
  $: store.set(value);
</script>

<Checkbox bind:checked={value} color="blue">
  <span class="option-label">{name}</span>
</Checkbox>
