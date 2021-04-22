<script>
  import { writable } from 'svelte/store';
  import {
    showModMessage,
    language,
    customFilters,
    channelFilters
  } from '../../js/store.js';
  import { Subheader, List, ListItem, ExpansionPanels, ExpansionPanel } from 'svelte-materialify/src';
  import { languageNameValues } from '../../js/constants.js';
  import CheckOption from '../options/Toggle.svelte';
  import CustomFilter from '../options/CustomFilter.svelte';
  import EnumOption from '../options/FilterSelector.svelte';
  import ListEdit from '../options/ListEdit.svelte';
  import SelectOption from '../options/Dropdown.svelte';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  export let isStandalone = false;

</script>

<SelectOption
  name="Language filter"
  store={language}
  items={languageNameValues}
/>
<CheckOption name="Show moderator messages" store={showModMessage} />
<MultiDropdown
  name="Blocked users"
  store={channelFilters}
  getDisplayName={(n, v) => v.name}
  getBool={n => channelFilters.get(n).blacklist}
  setBool={(n, v) =>
    channelFilters.set(n, { ...channelFilters.get(n), blacklist: v })}
/>
<div class="filter-options">
  <Subheader>Custom filter options</Subheader>
  {#each $customFilters as rule}
    <CustomFilter {...rule} />
  {/each}
</div>
