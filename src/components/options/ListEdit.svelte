<script>
  import { List, ListItem, Divider, TextField, Card, Subheader, MaterialApp } from 'svelte-materialify/src';

  let items = [];

  function handleKeyUp(e) {
    if (e.key === 'Enter') {
      items = [...items, newItem];
      newItem = '';
    }
  }

  $: newItem = '';
  $: items = items.filter(e => e);
</script>

<MaterialApp theme="dark">
  <div class="list">
    <List>
      <Subheader>Regex filters</Subheader>
      {#each items as item}
        <ListItem><TextField dense clearable bind:value={item}></TextField></ListItem>
      {/each}
      <ListItem>
        <TextField on:keyup={handleKeyUp} dense clearable={newItem} bind:value={newItem}>
          Add New
        </TextField>
      </ListItem>
      <Divider />
    </List>
  </div>
</MaterialApp>

<style>
  /* Enable the following to get lighter bg on listmenu
  .list {
    background-color: #1E1E1E;
  }
  */
</style>