<script lang="ts">
  import { onMount } from 'svelte';
  import {
    showModMessage,
    language,
    customFilters,
    enableMchadTLs,
    enableAPITLs
  } from '../../js/store.js';
  import { addFilter, cleanupFilters } from '../../js/filter.js';
  import { languageNameValues } from '../../js/constants.js';
  import CustomFilter from '../options/CustomFilter.svelte';
  import BlockedUsers from './BlockedUsers.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import Dropdown from '../common/DropdownStore.svelte';
  import Card from '../common/Card.svelte';
  import SpamProtection from './SpamProtection.svelte';

  function createNewFilter() {
    cleanupFilters();
    addFilter('chat', 'plain', 'show', '');
  }

  let div: HTMLElement;

  onMount(cleanupFilters);
</script>

<div bind:this={div}>
  <Dropdown
    name="Language filter"
    store={language}
    items={languageNameValues}
    boundingDiv={div}
  />
  <div class="mt-6">
    <Checkbox name="Show moderator and owner messages" store={showModMessage} />
  </div>
  <BlockedUsers boundingDiv={div} />
  <SpamProtection boundingDiv={div} />
  <Card
    title="External translation sources"
    icon="cloud"
    noGap
  >
    <Checkbox name="LiveTL API" store={enableAPITLs} />
    <Checkbox name="MChad (volunteer translators)" store={enableMchadTLs} />
  </Card>
  <Card
    title="Custom filters"
    icon="filter_alt"
    headerEndIcon="add"
    headerEndIconOnClick={createNewFilter}
  >
    {#each $customFilters as rule}
      <CustomFilter {...rule} boundingDiv={div} />
    {/each}
  </Card>
</div>
