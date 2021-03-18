<script>
  import { Switch } from 'svelte-materialify';

  export let name = "";
  export let store = null;

</script>

<Switch on:change={store.update(n => !n)} color="blue" checked={$store} inset>{name} value: {$store}</Switch>