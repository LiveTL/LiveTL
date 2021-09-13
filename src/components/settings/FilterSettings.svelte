<script lang="ts">
  import { onMount } from 'svelte';
  import { customFilters } from '../../js/store.js';
  import { addFilter, cleanupFilters } from '../../js/filter.js';
  import CustomFilter from '../options/CustomFilter.svelte';
  import Card from '../common/Card.svelte';
  import CommonFilterCards from './CommonFilterCards.svelte';
  import SpamProtection from './SpamProtection.svelte';

  function createNewFilter() {
    cleanupFilters();
    addFilter('chat', 'plain', 'show', '');
  }

  let div: HTMLElement;

  onMount(cleanupFilters);
</script>

<div bind:this={div}>
  <CommonFilterCards {div}>
    <div slot="extras">
      <SpamProtection boundingDiv={div} />
    </div>
  </CommonFilterCards>
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
