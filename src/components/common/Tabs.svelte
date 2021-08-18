<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import { Tabs, Tab, TabButton } from 'smelte';

  type TabsItem = {
    id: string;
    text: string;
    icon: string;
    component: typeof SvelteComponent;
  };

  export let selected: string | null = null;
  export let items: TabsItem[] = [];

  const classes = 'y-0 items-center relative z-20';
  const tabButtonClasses = 'duration-100 relative overflow-hidden text-center w-full p-2 cursor-pointer flex mx-auto items-center text-sm';
</script>

<div>
  <Tabs
    {selected}
    let:selected={tabSelected}
    let:item
    {items}
    {classes}
  >
    <TabButton
      slot="item"
      classes={tabButtonClasses}
      bind:selected
      {...item}
    >
      {item.text}
    </TabButton>
    <div slot="content" class="p-4">
      {#each items as tab}
        <Tab id={tab.id} selected={tabSelected}>
          <svelte:component this={tab.component} />
        </Tab>
      {/each}
    </div>
  </Tabs>
</div>
