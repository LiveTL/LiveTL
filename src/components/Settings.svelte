<script lang="ts">
  import UISettings from './settings/UISettings.svelte';
  import FilterSettings from './settings/FilterSettings.svelte';
  import KeyboardShortcuts from './settings/KeyboardShortcuts.svelte';
  import About from './settings/About.svelte';
  import Tabs from './common/Tabs.svelte';
  import { isTwitch } from '../js/constants.js';
  import type { SvelteComponent } from 'svelte';

  let id = 1;
  const items: { id: string, text: string, icon: string, component: typeof SvelteComponent }[] = [];

  function addTab(text: string, component: typeof SvelteComponent, icon: string) {
    items.push({
      id: `${id++}`,
      text,
      component,
      icon
    });
  }

  addTab('Interface', UISettings, 'brush');
  addTab('Filters', FilterSettings, 'filter_alt');
  if (!isTwitch) addTab('Shortcuts', KeyboardShortcuts, 'keyboard');
  addTab('About', About, 'info');
</script>

<Tabs selected="1" items={items} />
