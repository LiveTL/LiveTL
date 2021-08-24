<script lang="ts">
  import { onMount } from 'svelte';
  import {
    showModMessage,
    language,
    customFilters,
    enableMchadTLs,
    enableAPITLs,
    ytcDeleteBehaviour
  } from '../../js/store.js';
  import { addFilter, cleanupFilters } from '../../js/filter.js';
  import { languageNameValues, ytcDeleteMap } from '../../js/constants.js';
  import CustomFilter from '../options/CustomFilter.svelte';
  import BlockedUsers from './BlockedUsers.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import Dropdown from '../common/DropdownStore.svelte';
  import Radio from '../common/RadioGroupStore.svelte';
  import Card from '../common/Card.svelte';

  function createNewFilter () {
    cleanupFilters();
    addFilter('chat', 'plain', 'show', '');
  }

  onMount(cleanupFilters);
</script>

<Dropdown
  name="Language filter"
  store={language}
  items={languageNameValues}
/>
<div class="mt-6">
  <Checkbox name="Show moderator and owner messages" store={showModMessage} />
</div>
<BlockedUsers />
<Card
  title="When messages are deleted by moderators:"
>
  <Radio
    store={ytcDeleteBehaviour}
    map={ytcDeleteMap}
    vertical
  />
</Card>
<Card
  title="External translation sources"
  noGap
>
  <Checkbox name="LiveTL API" store={enableAPITLs} />
  <Checkbox name="MChad (volunteer translators)" store={enableMchadTLs} />
</Card>
<Card
  title="Custom filters"
  headerEndIcon="add"
  headerEndIconOnClick={createNewFilter}
>
  {#each $customFilters as rule}
    <CustomFilter {...rule} />
  {/each}
</Card>
