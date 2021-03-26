<script>
  import { Tabs, Tab, TabContent, MaterialApp } from "svelte-materialify/src";
  import UISettings from "./settings/UISettings.svelte";
  import FilterSettings from "./settings/FilterSettings.svelte";

  export let isStandalone = false;

  const settings = [
    { name: "Interface", component: UISettings },
    { name: "Filters", component: FilterSettings },
  ];
</script>

<MaterialApp theme="dark">
  <div style="display: flex; align-items: center; justify-content: center;">
    <div style="max-width: 500px; width: 100%;">
      <Tabs grow fixedTabs>
        <div slot="tabs">
          {#each settings as { name }}
            <Tab>{name}</Tab>
          {/each}
        </div>

        <div>
          {#each settings as { component }}
            <TabContent>
              <div
                style="font-size: 16px !important; margin: auto; margin-top: 10px;"
              >
                <svelte:component this={component} {isStandalone} />
              </div>
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
  :global(.s-window) {
    padding: 0px 10px 0px 10px;
  }
</style>
