<script>
  import { mdiClose } from "@mdi/js";
  import { Button, Divider, Icon, Menu, TextField, ListItem } from "svelte-materialify/src";

  export let name = "";
  export let store = null; // LookupStore
  export let getDisplayName = (key, value) => `${key}`;
  export let getBool = key => store.get(key);
  export let setBool = (key, val) => store.set(key, val);

  function getItems(s) {
    const items = [];
    Object.entries(store._lookup).forEach(([key, value]) => {
      if (key && getBool(key)) items.push({ key, item: getDisplayName(key, value) });
    });
    return items;
  }

  $: items = getItems($store);
</script>

<div class="dropdown">
  <Menu offsetY={false} closeOnClick={false}>
    <div class="dropdown-label" slot="activator">
      <TextField disabled={null} solo={true} value={name} readonly></TextField>
    </div>

    {#if items.length}
      {#each items as item, i}
        {#if i}
          <Divider />
        {/if}
        <!--TODO make it show a menu when listitem is clicked-->
        <ListItem>
          <div class="listitem-content">
            <div class="item">{item.item}</div>
            <div class="button">
              <Button fab size="x-small" on:click={() => {setBool(item.key, false); items = items.filter(i => i != item)}}>
                <Icon path={mdiClose} size="14px" />
              </Button>
            </div>
          </div>
        </ListItem>
      {/each}
    {:else}
      <ListItem>none</ListItem>
    {/if}
  </Menu>
</div>

<style>
  .dropdown {
    margin-top: 20px;
    width: 100%;
  }

  .item {
    padding-top: 7px;
  }

  .listitem-content {
    display: flex;
    flex-direction: row;
  }


  :global(.dropdown input:hover) {
    cursor: pointer;
  }

  .button {
    margin-left: auto;
    order: 2;
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