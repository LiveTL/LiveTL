<script>
  import { Switch } from 'svelte-materialify/src';
  export let name = '';
  export let store = null;
</script>

<Switch on:change={store.update(n => !n)} color="blue" checked={$store} dense>
  <span class="option-label">{name}</span>
</Switch>