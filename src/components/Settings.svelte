<script>
  import { Tabs, Tab, TabContent, MaterialApp } from "svelte-materialify/src";
  import UISettings from "./settings/UISettings.svelte";

  export let isStandalone = false;

  const settings = [
    { name: "LiveTL Interface", component: UISettings },
    { name: "Advanced Options", component: UISettings },
  ];
</script>

<MaterialApp theme="dark">
  <div style="display: flex; align-items: center; justify-content: center;">
    <div style="max-width: 500px; width: 100%;">
      <Tabs grow>
        <div slot="tabs">
          {#each settings as { name }}
            <Tab>{name}</Tab>
          {/each}
        </div>

        <div style="margin-top: 40px;">
          {#each settings as { component }}
            <TabContent>
              <svelte:component this={component} {isStandalone} />
            </TabContent>
          {/each}
        </div>
      </Tabs>
    </div>
  </div>
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
