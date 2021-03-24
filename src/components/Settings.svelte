<script>
  import { Tabs, Tab, TabContent, MaterialApp } from "svelte-materialify/src";
  import UISettings from "./settings/UISettings.svelte";

  export let isStandalone = false;

  const settings = [
    { name: "LiveTL Interface", component: UISettings }
  ];
</script>

<MaterialApp theme="dark">
  <Tabs centerActive>
    <div slot="tabs">
      {#each settings as { name }}
        <Tab>{name}</Tab>
      {/each}
    </div>

    {#each settings as { component }}
      <TabContent>
        <br /><br />
        <svelte:component this={component} {isStandalone} />
      </TabContent>
    {/each}
  </Tabs>
</MaterialApp>

<style>
  :global(label > .option-label) {
    padding-top: 0px;
    top: 0px;
  }

  :global(.option-label) {
    height: 20px;
    line-height: 20px;
    white-space: nowrap;
    color: var(--theme-text-secondary);
    font-size: 16px;
  }
</style>