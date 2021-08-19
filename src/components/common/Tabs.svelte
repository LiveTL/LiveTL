<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import { Tabs, Tab, TabButton } from 'smelte/src/components/Tabs';

  type TabsItem = {
    id: string;
    text: string;
    icon: string;
    component: typeof SvelteComponent;
  };

  export let selected: string | null = null;
  export let items: TabsItem[] = [];
  export let maxButtonWidth: number | null = null;

  const getTabButtonClasses = (maxButtonWidth: number | null) => {
    const defaultClasses = 'duration-75 relative overflow-hidden ' +
      'text-center p-2 cursor-pointer flex mx-auto items-center text-sm';
    if (maxButtonWidth == null) {
      return defaultClasses + ' w-full';
    }
    return defaultClasses + ` w-${maxButtonWidth} flex-shrink-0 flex-auto`;
  };

  const classes = 'y-0 items-center relative z-20';
  $: tabButtonClasses = getTabButtonClasses(maxButtonWidth);
</script>

<div>
  <Tabs
    {selected}
    let:selected={tabSelected}
    let:item
    {items}
    {classes}
    indicator={false}
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
