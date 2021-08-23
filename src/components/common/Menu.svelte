<script lang="ts">
  import type { ListItemBase } from 'smelte/src/components/List/ListItem';
  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import Menu from 'smelte/src/components/Menu';
  import List from 'smelte/src/components/List';

  type MenuItem = ListItemBase & {
    onClick?: () => void;
    selected?: boolean;
  };

  export let items: MenuItem[];
  export let width = 'max';
  export let visible = true;

  let selected = '';
  let open = false;
  let activator: HTMLElement;
  let listDiv: HTMLElement;
  let windowInnerHeight = 0;
  let windowInnerWidth = 0;
  let offset = '';

  const onSelectedChange = (selected?: string) => {
    const item = items.find((i) => i.value === selected);
    if (!item || !item.onClick) return;

    item.onClick();
    item.selected = false;
  };

  const onOpenChange = async (open: boolean) => {
    if (!open) return;

    await tick(); // Wait for listDiv to exist

    let offsetY: string;
    let offsetX: string;
    const activatorRect = activator.getBoundingClientRect();
    if (activatorRect.bottom + listDiv.clientHeight > windowInnerHeight) {
      offsetY = 'bottom-7';
    } else {
      offsetY = 'top-7';
    }

    if (activatorRect.right + listDiv.clientWidth > windowInnerWidth) {
      offsetX = 'right-0';
    } else {
      offsetX = 'left-0';
    }

    offset = `${offsetY} ${offsetX}`;
  };

  $: onSelectedChange(selected);
  $: onOpenChange(open);
  $: listClasses = 'absolute bg-white rounded shadow z-20 dark:bg-dark-500 ' +
    `w-${width} ${offset}`;
  // TODO: Max width based on popout size
</script>

<svelte:window
  bind:innerHeight={windowInnerHeight}
  bind:innerWidth={windowInnerWidth}
/>

<div class={open || visible ? 'visible' : 'invisible'}>
  <Menu {items} bind:open>
    <div
      on:click={() => (open = !open)}
      slot="activator"
      bind:this={activator}
    >
      <slot name="activator" />
    </div>
    <div slot="menu">
      {#if open}
        <div
          class={listClasses}
          transition:fade={{ duration: 200 }}
          bind:this={listDiv}
        >
          <List
            bind:value={selected}
            select
            dense
            {items}
            on:change={() => (open = false)}
          />
        </div>
      {/if}
    </div>
  </Menu>
</div>
