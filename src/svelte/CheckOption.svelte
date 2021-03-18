<script>
  import { Switch } from 'svelte-materialify';

  export let name = "";
  export let store = null;

  let checked = store ? $store : false;
</script>

<Switch bind:checked on:change={() => store.set(checked)} color="blue" dense>{name}</Switch>