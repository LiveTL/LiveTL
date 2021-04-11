<script>
  import {
    List,
    ListItem,
    Divider,
    TextField,
    Card,
    Subheader,
    MaterialApp
  } from "svelte-materialify/src";

  export let name = "";
  export let store = null;

  function handleKeyUp(e) {
    if (e.key === "Enter") {
      items = [...items, newItem];
      newItem = "";
    }
  }

  $: items = $store;
  $: newItem = "";
  $: items = items.filter(e => e);
  $: store.set(items);
</script>

<MaterialApp theme="dark">
  <div class="list">
    <List>
      <Subheader>{name}</Subheader>
      {#each items as item}
        <ListItem><TextField dense clearable bind:value={item} /></ListItem>
      {/each}
      <ListItem>
        <TextField
          on:keyup={handleKeyUp}
          dense
          clearable={newItem}
          bind:value={newItem}
        >
          Add new (Press enter to save)
        </TextField>
      </ListItem>
      <Divider />
    </List>
  </div>
</MaterialApp>

<style>
  :global(.material-ripple) {
    display: none !important;
  }
  /* Enable the following to get lighter bg on listmenu
  .list {
    background-color: #1E1E1E;
  }
  */
  :global(.s-text-field__input label.active) {
    transform: translateY(-20px) scale(0.75);
  }
</style>
