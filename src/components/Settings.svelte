<script lang="ts">
  import UISettings from './settings/UISettings.svelte';
  import FilterSettings from './settings/FilterSettings.svelte';
  import KeyboardShortcuts from './KeyboardShortcuts.svelte';
  import About from './settings/About.svelte';
  import Tabs from './common/Tabs.svelte';

  const settings = [
    { id: '1', text: 'Interface', component: UISettings, icon: 'brush' },
    { id: '2', text: 'Filters', component: FilterSettings, icon: 'filter_alt' },
    { id: '3', text: 'Keyboard Shortcuts', component: KeyboardShortcuts, icon: 'keyboard' },
    { id: '4', text: 'About', component: About, icon: 'info' }
  ];
</script>

<Tabs selected="1" items={settings} />
