<script>
  import { Checkbox } from 'svelte-materialify/src';
  export let name = '';
  export let store = null;
</script>

<Checkbox bind:checked={$store} color="blue">
  <span class="option-label">{name}</span>
</Checkbox>
