<script>
  import { onMount } from 'svelte';
  import {
    showModMessage,
    language,
    customFilters,
    channelFilters,
    enableMchadTLs,
    enableAPITLs,
    mchadUsers,
    ytcDeleteBehaviour
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
  import { languageNameValues, ytcDeleteValues } from '../../js/constants.js';
  import CheckOption from '../options/Toggle.svelte';
  import CustomFilter from '../options/CustomFilter.svelte';
  import SelectOption from '../options/Dropdown.svelte';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  import { Radio } from 'svelte-materialify/src';

  function createNewFilter() {
    cleanupFilters();
    addFilter('chat', 'plain', 'show', '');
  }

  onMount(cleanupFilters);

  $: deleteBehaviourGroup = $ytcDeleteBehaviour;
  $: ytcDeleteBehaviour.set(deleteBehaviourGroup);
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
<Subheader>When messages are deleted by moderators:</Subheader>
{#each [...ytcDeleteValues.keys()] as key}
  <Radio bind:group={deleteBehaviourGroup} value={key} style='padding-bottom: 5px;' color='blue'>
    {ytcDeleteValues.get(key)}
  </Radio>
{/each}
<Row>
  <Col>
    <Subheader>External translation sources</Subheader>
    <CheckOption name="LiveTL API" store={enableAPITLs} />
    <CheckOption name="MChad (volunteer translators)" store={enableMchadTLs} />
  </Col>
</Row>
{#if $enableMchadTLs}
  <MultiDropdown
    name="Blocked MCHAD translators"
    store={mchadUsers}
  />
{/if}
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
    <CustomFilter {...rule} />
  {/each}
</div>

<style>
</style>
