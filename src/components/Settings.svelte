<script>
  import { beforeUpdate, afterUpdate, onMount, onDestroy } from 'svelte';
  import { Tabs, Tab, TabContent, MaterialApp } from 'svelte-materialify/src';
  import UISettings from './settings/UISettings.svelte';
  import FilterSettings from './settings/FilterSettings.svelte';

  export let isStandalone = false;
  export let isResizing = false;

  const settings = [
    { name: 'Interface', component: UISettings },
    { name: 'Filters', component: FilterSettings },
  ];

  let wrapper = null;
  function redrawSlider() {
    const sliderElement = wrapper.querySelector('.ltl-settings-slider');
    const activeTab = wrapper.querySelector(
      '.ltl-settings-tabs .s-tab.s-slide-item.active'
    );
    if (
      !sliderElement ||
      !activeTab ||
      !sliderElement.offsetParent ||
      !activeTab.offsetParent
    )
      return;

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
      redrawSlider();
    }
    callRedrawSlider = false;
  });
</script>

<svelte:window on:resize={redrawSlider} />

<MaterialApp theme="dark">
  <div
    style="display: flex; align-items: center; justify-content: center;"
    bind:this={wrapper}
  >
    <div style="max-width: calc(min(500px, 100%)); width: 100%;">
      <Tabs
        grow
        fixedTabs
        showArrows={false}
        class="ltl-settings-tabs"
        sliderClass="ltl-settings-slider"
      >
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
