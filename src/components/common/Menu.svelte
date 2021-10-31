<script lang="ts">
  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import Menu from 'smelte/src/components/Menu';
  import List from 'smelte/src/components/List';
  import Icon from './Icon.svelte';

  type MenuItem = {
    icon: string;
    value: string;
    text: string;
    onClick?: () => void;
  };

  export let items: MenuItem[];
  export let visible = true;

  let open = false;
  let activator: HTMLElement | undefined;
  let listDiv: HTMLElement | undefined;
  let windowInnerHeight = 0;
  let windowInnerWidth = 0;
  let offsetX = '';
  let offsetYStyle = '';

  const onItemClick = (item: MenuItem): void => {
    open = false;
    if (!item || !item.onClick) return;

    item.onClick();
  };

  const onOpenChange = async (open: boolean) => {
    if (!open) return;

    await tick(); // Wait for listDiv to exist
    if (!activator || !listDiv) {
      console.error('Menu activator or listDiv undefined');
      return;
    }

    const activatorRect = activator.getBoundingClientRect();
    const offsetY = activator.clientHeight + 5;
    if (activatorRect.bottom + listDiv.clientHeight > windowInnerHeight) {
      offsetYStyle = `bottom: ${offsetY}px;`;
    } else {
      offsetYStyle = `top: ${offsetY}px;`;
    }

    if (activatorRect.right + listDiv.clientWidth > windowInnerWidth) {
      offsetX = 'right-0';
    } else {
      offsetX = 'left-0';
    }
  };

  $: onOpenChange(open);
  $: classes = (open || visible ? 'visible' : 'invisible') + ' ' +
    ($$props.class ? $$props.class : '');
  $: menuClasses = 'absolute bg-white rounded shadow z-20 dark:bg-dark-500 ' +
    `w-max ${offsetX}`;
  const listItemClasses = 'focus:bg-gray-50 dark-focus:bg-gray-700 ' +
  'hover:bg-gray-transDark relative overflow-hidden duration-100 ' +
  'cursor-pointer text-gray-700 dark:text-gray-100 flex items-center z-10';
</script>

<svelte:window
  bind:innerHeight={windowInnerHeight}
  bind:innerWidth={windowInnerWidth}
/>

<div class={classes}>
  <Menu bind:open>
    <div
      on:click={() => (open = !open)}
      slot="activator"
      bind:this={activator}
    >
      <slot name="activator" />
    </div>
    <svelte:fragment slot="menu">
      {#if open}
        <div
          class={menuClasses}
          transition:fade={{ duration: 150 }}
          bind:this={listDiv}
          style="max-width: 20em; font-size: 0.9em; {offsetYStyle}"
        >
          <List
            select
            dense
          >
            <svelte:fragment slot="items">
              {#each items as item}
                <li
                  class={listItemClasses}
                  on:click={() => onItemClick(item)}
                  style="padding: 0.5em 1em"
                >
                  <Icon class="pr-6">
                    {item.icon}
                  </Icon>
                  <span>{item.text}</span>
                </li>
              {/each}
            </svelte:fragment>
          </List>
        </div>
      {/if}
    </svelte:fragment>
  </Menu>
</div>
