<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  type TabsItem = {
    id: string;
    text: string;
    icon: string;
    component: typeof SvelteComponent;
  };

  export let selected: string | null = null;
  export let items: TabsItem[] = [];
  export let buttonFullWidth = false;

  $: if (selected == null && items.length > 0) selected = items[0].id;

  const classes = 'y-0 items-center relative z-10';
  $: tabButtonClasses = 'duration-75 relative overflow-hidden ' +
      'text-center p-2 cursor-pointer flex mx-auto items-center text-sm ' +
      `${buttonFullWidth ? 'w-full' : 'w-24 flex-shrink-0 flex-auto'}`;
</script>

<div class="text-base">
  <div class="flex {classes}" role="tablist">
    {#each items as item}
      <button type="button" role="tab" aria-selected={selected === item.id} class="{tabButtonClasses} {selected === item.id ? 'text-primary-500 border-b-2 border-primary-500' : ''}" on:click={() => (selected = item.id)}>{item.text}</button>
    {/each}
  </div>
  <div class="p-4">
    {#each items as tab}
      {#if selected === tab.id}<svelte:component this={tab.component} />{/if}
    {/each}
  </div>
</div>
