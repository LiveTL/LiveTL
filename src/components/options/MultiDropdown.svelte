<script>
  import { mdiClose } from "@mdi/js";
  import { Button, Icon, Menu, TextField, ListItem } from "svelte-materialify/src";

  export let name = "";
  export let store = null; // LookupStore

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

    {#each items as item}
      <ListItem>
        {item}
        <div class="button">
          <Button fab size="x-small">
            <Icon path={mdiClose} size="14px" />
          </Button>
        </div>
      </ListItem>
    {/each}
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

  .button {
    float: right;
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