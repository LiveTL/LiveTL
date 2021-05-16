<script>
  import { onMount } from 'svelte';
  import {
    showModMessage,
    language,
    customFilters,
    channelFilters
  } from '../../js/store.js';
  import {
    Row,
    Col,
    Button,
    Icon,
    Subheader
  } from 'svelte-materialify/src';
  import { mdiPlus } from '@mdi/js';
  import { addFilter, cleanupFilters } from '../../js/filter.js';
  import { languageNameValues } from '../../js/constants.js';
  import CheckOption from '../options/Toggle.svelte';
  import CustomFilter from '../options/CustomFilter.svelte';
  import SelectOption from '../options/Dropdown.svelte';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  export let isStandalone = false;

  function createNewFilter() {
    cleanupFilters();
    addFilter('chat', 'plain', 'show', '');
  }

  onMount(cleanupFilters);

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
  <Row>
    <Col>
      <Subheader>Custom filters</Subheader>
    </Col>
    <Col style="padding-right: 2px;">
      <Subheader style="float: right; padding-right: 0px">
        <Button icon on:click={createNewFilter}>
          <Icon path={mdiPlus} />
        </Button>
      </Subheader>
    </Col>
  </Row>
  {#each $customFilters as rule, i}
    <CustomFilter
      {...rule}
    />
  {/each}
</div>

<style>
</style>
