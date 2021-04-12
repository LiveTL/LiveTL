<script>
  import { Checkbox } from 'svelte-materialify/src';
  export let name = '';
  export let store = null;
</script>

<Checkbox on:change={store.update((n) => !n)} color="blue" checked={$store}>
  <span class="option-label">{name}</span>
</Checkbox>
