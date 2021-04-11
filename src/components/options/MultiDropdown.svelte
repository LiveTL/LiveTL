<script>
  import { Icon, Menu, TextField, List, ListItem } from "svelte-materialify/src";

  export let name = "";
  export let store = null; // LookupStore

  function correctValue() {
    console.log(value);
    return
    if (value == null) {
      value = $store;
    }
    if (typeof value != "string") {
      value = value[0];
    }
  }

  function getItems() {
    const items = [];
    Object.entries(store._lookup).forEach(([key, value]) => {
      if (key) items.push(`${key}`);
    });
    return ['bruh', 'moment'];
    return items;
  }

  $: items = getItems($store);
  $: console.log(items);
</script>

<div class="dropdown">
  <Menu offsetY={false} closeOnClick={false}>
    <div class="dropdown-label" slot="activator">
      <TextField disabled={null} solo={true} value={name} readonly></TextField>
    </div>

    <List multiple={true} max={Infinity}>
      {#each items as item}
        <ListItem>
          {item}
        </ListItem>
      {/each}
    </List>
  </Menu>
</div>

<style>
  .dropdown {
    margin-top: 20px;
    width: 100%;
  }

  .dropdown:hover, .dropdown-label:hover, .dropdown > *:hover {
    cursor: pointer;
  }

  :global(.dropdown > div) {
    width: 100%;
  }

  :global(.s-menu:hover) {
    cursor: pointer;
  }

  :global(.s-menu) {
    width: 100%;
  }

</style>