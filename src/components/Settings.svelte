<script>
  import { beforeUpdate, afterUpdate } from 'svelte';
  import { Tabs, Tab, TabContent, MaterialApp } from 'svelte-materialify/src';
  import UISettings from './settings/UISettings.svelte';
  import FilterSettings from './settings/FilterSettings.svelte';

  export let isStandalone = false;
  export let isResizing = false;

  const settings = [
    { name: 'Interface', component: UISettings },
    { name: 'Filters', component: FilterSettings }
  ];

  function redrawSlider() {
    const sliderElement = document.querySelector('.s-tab-slider');
    const activeTab = document.querySelector('.s-tab.s-slide-item.active');
    if (
      !sliderElement || 
      !activeTab || 
      !sliderElement.offsetParent || 
      !activeTab.offsetParent) return;

    sliderElement.style.left = `${activeTab.offsetLeft}px`;
    sliderElement.style.width = `${activeTab.offsetWidth}px`;
  }

  let callRedrawSlider = false;
  let wasResizing = false;
  $: wasResizing = !isResizing;
  beforeUpdate(() => {
    if (wasResizing) {
      callRedrawSlider = true;
    }
  });
  afterUpdate(() => {
    if (callRedrawSlider) {
      redrawSlider()
    }
    callRedrawSlider = false;
  });
  window.onresize = redrawSlider;
</script>

<MaterialApp theme="dark">
  <div style="display: flex; align-items: center; justify-content: center;">
    <div style="max-width: calc(min(500px, 100%)); width: 100%;">
      <Tabs grow fixedTabs showArrows={false}>
        <div slot="tabs">
          {#each settings as { name }}
            <Tab>{name}</Tab>
          {/each}
        </div>

        <div>
          {#each settings as { component }}
            <TabContent>
              <div
                style="font-size: 16px !important; margin: 15px 0px 15px 0px;"
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
