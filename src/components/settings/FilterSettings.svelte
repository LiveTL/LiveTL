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
  import { mdiPlus } from '@mdi/js';
  import { addFilter, cleanupFilters } from '../../js/filter.js';
  import { languageNameValues, ytcDeleteMap } from '../../js/constants.js';
  import CustomFilter from '../options/CustomFilter.svelte';
  import BlockedUsers from '../BlockedUsers.svelte';
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
<Checkbox name="Show moderator messages" store={showModMessage} />
<BlockedUsers />
<h6>When messages are deleted by moderators:</h6>
<Radio
  store={ytcDeleteBehaviour}
  map={ytcDeleteMap}
  vertical
/>
<div>
  <h6>External translation sources</h6>
  <Checkbox name="LiveTL API" store={enableAPITLs} />
  <Checkbox name="MChad (volunteer translators)" store={enableMchadTLs} />
</div>
<Card
  title="Custom filters"
  titleButtonPath={mdiPlus}
  titleButtonOnClick={createNewFilter}
>
  {#each $customFilters as rule}
    <CustomFilter {...rule} />
  {/each}
</Card>
