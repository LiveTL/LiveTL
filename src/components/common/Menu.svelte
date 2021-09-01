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
  export let visible = true;

  let open = false;
  let activator: HTMLElement | undefined;
  let listDiv: HTMLElement | undefined;
  let windowInnerHeight = 0;
  let windowInnerWidth = 0;
  let offset = '';

  const onListChange = (e: CustomEvent<string>) => {
    open = false;
    const item = items.find((i) => i.value === e.detail);
    if (!item || !item.onClick) return;

    item.onClick();
  };

  const onOpenChange = async(open: boolean) => {
    if (!open) return;

    await tick(); // Wait for listDiv to exist
    if (!activator || !listDiv) {
      console.error('Menu activator or listDiv undefined');
      return;
    }

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

  $: onOpenChange(open);
  $: classes = (open || visible ? 'visible' : 'invisible') + ' ' +
    ($$props.class ? $$props.class : '');
  $: listClasses = 'absolute bg-white rounded shadow z-20 dark:bg-dark-500 ' +
    `max-w-xs w-max ${offset}`;
</script>

<svelte:window
  bind:innerHeight={windowInnerHeight}
  bind:innerWidth={windowInnerWidth}
/>

<div class={classes}>
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
            select
            dense
            {items}
            on:change={onListChange}
          />
        </div>
      {/if}
    </div>
  </Menu>
</div>