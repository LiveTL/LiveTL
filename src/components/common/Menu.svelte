<script lang="ts">
  import type { ListItemBase } from 'smelte/src/components/List/ListItem';
  import { fade } from 'svelte/transition';
  import Menu from 'smelte/src/components/Menu';
  import List from 'smelte/src/components/List';

  type MenuItem = ListItemBase & {
    onClick?: () => void;
  };

  export let items: MenuItem[];
  export let width = 'max';
  export let anchor = 'right';
  export let visible = true;

  let selected: string;
  let open = false;
  let activator: HTMLElement;
  let windowInnerHeight = 0;
  let offset = '';

  const onSelectedChange = (selected?: string) => {
    items.find((i) => i.value === selected)?.onClick?.();
  };

  const onOpenChange = (open: boolean) => {
    if (!open) return;

    const rect = activator.getBoundingClientRect();
    console.debug({ rect, windowInnerHeight });
    if (rect.bottom + 16 + (40 * items.length) > windowInnerHeight) {
      offset = 'bottom-7';
    } else {
      offset = 'top-7';
    }
  };

  $: onSelectedChange(selected);
  $: onOpenChange(open);
  $: listClasses = 'absolute bg-white rounded shadow z-20 dark:bg-dark-500 ' +
    `w-${width} ${anchor}-0 ${offset}`;
</script>

<svelte:window bind:innerHeight={windowInnerHeight} />

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
        <div class={listClasses} transition:fade={{ duration: 200 }}>
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
