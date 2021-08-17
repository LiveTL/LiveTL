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
  import {
    Row,
    Col,
    Button,
    Icon,
    Radio,
    Subheader
  } from 'svelte-materialify/src';
  import { mdiPlus } from '@mdi/js';
  import { addFilter, cleanupFilters } from '../../js/filter.js';
  import { languageNameValues, ytcDeleteValues } from '../../js/constants.js';
  import CustomFilter from '../options/CustomFilter.svelte';
  import BlockedUsers from '../BlockedUsers.svelte';
  import Checkbox from '../common/CheckboxStore.svelte';
  import Dropdown from '../common/DropdownStore.svelte';

  function createNewFilter () {
    cleanupFilters();
    addFilter('chat', 'plain', 'show', '');
  }

  onMount(cleanupFilters);

  $: deleteBehaviourGroup = $ytcDeleteBehaviour;
  $: ytcDeleteBehaviour.set(deleteBehaviourGroup);
</script>

<Dropdown
  name="Language filter"
  store={language}
  items={languageNameValues}
/>
<Checkbox name="Show moderator messages" store={showModMessage} />
<BlockedUsers />
<Subheader>When messages are deleted by moderators:</Subheader>
{#each [...ytcDeleteValues.keys()] as key}
  <Radio bind:group={deleteBehaviourGroup} value={key} style='padding-bottom: 5px;' color='blue'>
    {ytcDeleteValues.get(key)}
  </Radio>
{/each}
<Row>
  <Col>
    <Subheader>External translation sources</Subheader>
    <Checkbox name="LiveTL API" store={enableAPITLs} />
    <Checkbox name="MChad (volunteer translators)" store={enableMchadTLs} />
  </Col>
</Row>
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
