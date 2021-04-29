<script>
  import { writable } from 'svelte/store';
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
    Subheader,
    List,
    ListItem,
    ExpansionPanels,
    ExpansionPanel
  } from 'svelte-materialify/src';
  import { mdiPlus } from '@mdi/js';
  import { cleanupFilters } from '../../js/filter.js';
  import { languageNameValues } from '../../js/constants.js';
  import CheckOption from '../options/Toggle.svelte';
  import CustomFilter from '../options/CustomFilter.svelte';
  import EnumOption from '../options/FilterSelector.svelte';
  import ListEdit from '../options/ListEdit.svelte';
  import SelectOption from '../options/Dropdown.svelte';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  export let isStandalone = false;

  function createNewFilter() {
    cleanupFilters();
    addFilter('chat', 'plain', 'Show', '');
  }

  onMount(cleanupFilters);

  let customFilterActive = false;
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
<div class="filter-options" class:padded={customFilterActive}>
  <Row>
    <Col>
      <Subheader>Custom filter options</Subheader>
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
      bind:active={customFilterActive}
      isNew={$customFilters.length - 1 == i}
    />
  {/each}
</div>

<style>
  .padded {
    margin-bottom: 50px;
  }
</style>
