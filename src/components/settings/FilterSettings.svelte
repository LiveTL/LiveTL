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
  import SvgButton from '../../submodules/chat/src/components/common/SvgButton.svelte';

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
<div class="p-2 rounded bg-gray-800">
  <div class="flex flex-row items-center">
    <h6 class="flex-1 pl-2">Custom filters</h6>
    <SvgButton
      transparent
      path={mdiPlus}
      on:click={createNewFilter}
      color="white"
      add="flex-none self-end"
    />
  </div>
  {#each $customFilters as rule, i}
    <CustomFilter {...rule} />
  {/each}
</div>
