<script>
  import { beforeUpdate, afterUpdate } from 'svelte';
  import { Icon, Tabs, Tab, TabContent, Tooltip, MaterialApp } from 'svelte-materialify/src';
  import { mdiBrush, mdiChat, mdiFilter, mdiHelp } from '@mdi/js';
  import UISettings from './settings/UISettings.svelte';
  import FilterSettings from './settings/FilterSettings.svelte';
  import TranslatorMode from './settings/TranslatorMode.svelte';
  import About from './About.svelte';
  import { isResizing } from '../js/store.js';

  const settings = [
    { name: 'Interface', component: UISettings, icon: mdiBrush },
    { name: 'Filters', component: FilterSettings, icon: mdiFilter },
    { name: 'Chat', component: TranslatorMode, icon: mdiChat },
    { name: 'About', component: About, icon: mdiHelp },
  ];

  let wrapper = null;
  function redrawSlider() {
    if (wrapper == null) return;
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
  $: wasResizing = !$isResizing;
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

  export let active = false;
  $: if (active) redrawSlider();
</script>

<svelte:window on:resize={redrawSlider} />

<MaterialApp theme="dark">
  <div class="settings-parent" bind:this={wrapper}>
    <div
      class="settings-container"
      style="max-width: calc(min(500px, 100%)); width: 100%;"
    >
      <Tabs
        grow
        fixedTabs
        class="ltl-settings-tabs"
        sliderClass="ltl-settings-slider"
      >
        <div slot="tabs">
          {#each settings as { icon, name }}
            <Tab>
              <Tooltip bottom>
                <div slot="tip">
                  <div style="text-align: center">{name}</div>
                </div>
                <div style="width: 100%; height: 100%;">
                  <Icon path={icon} />
                </div>
              </Tooltip>
            </Tab>
          {/each}
        </div>

        <div>
          {#each settings as { component }}
            <TabContent>
              <div
                style="font-size: 16px !important; margin: 15px 0px 15px 0px;"
              >
                <svelte:component this={component} />
              </div>
            </TabContent>
          {/each}
        </div>
      </Tabs>
    </div>
  </div>
</MaterialApp>

<style>
  .settings-parent {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    height: 100% !important;
    overflow: hidden;
  }
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
    height: 100%;
  }

  :global(.s-tabs) {
    height: 100%;
  }

  .settings-container {
    height: 100%;
  }

  .settings-container :global(.s-tooltip__wrapper) {
    width: 100%;
    height: 100%;
  }

  .settings-container :global(.s-tab) {
    padding-left: 0px;
    padding-right: 0px;
  }

  /* Center all icons horizontally and vertically */
  .settings-container :global(.s-tab i) {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }
</style>
