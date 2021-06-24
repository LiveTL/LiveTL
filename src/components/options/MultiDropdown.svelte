<script>
  import { onMount } from 'svelte';
  import { mdiClose } from '@mdi/js';
  import {
    Button,
    Divider,
    Icon,
    Menu,
    TextField,
    ListItem,
  } from 'svelte-materialify/src';

  export let name = '';
  export let store = null; // LookupStore
  export let getDisplayName = (key, value) => `${key}` || value;
  export let getBool = (key) => store.get(key);
  export let setBool = (key, val) => store.set(key, val);

  let field = null;
  $: if (field) {
    const elem = field.querySelector('.s-text-field__wrapper.solo');
    const svg = document.createElement('svg');
    elem.appendChild(svg);
    svg.outerHTML = `
      <span
        ><i
          aria-hidden="true"
          class="s-icon"
          aria-disabled="false"
          style="--s-icon-size:24px; --s-icon-rotate:0deg; margin-right: 8px;"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            viewBox="0 0 24 24"><path d="M7,10L12,15L17,10H7Z" /></svg
          >
        </i><!--<Icon>--></span
      >
    `;
  }

  function convertLookup(lookup) {
    return [...lookup]
      .filter(([key, value]) => key && getBool(key))
      .map(([key, value]) => ({ key, item: getDisplayName(key, value) }));
  }

  $: items = convertLookup($store);
</script>

<div class="dropdown">
  <Menu offsetY={false} closeOnClick={false}>
    <div class="dropdown-label" slot="activator" bind:this={field}>
      <TextField disabled={null} solo={true} value={name} readonly />
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
              <Button
                fab
                size="x-small"
                on:click={() => {
                  setBool(item.key, false);
                }}
              >
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
