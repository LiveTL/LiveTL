<script>
  import { Col, Row, Subheader } from 'svelte-materialify/src';
  import { channelFilters, enableMchadTLs, mchadUsers } from '../js/store.js';
  import MultiDropdown from './options/MultiDropdown.svelte';

  let ytcActive = false;
  let mchadActive = false;

  $: somethingActive = ytcActive || mchadActive;
</script>

<Subheader style="height: 1.5rem; margin-top: 1.5rem;">
  Blocked Users
</Subheader>

<Row class="flex-dropdown-row">
  {#if !somethingActive || ytcActive}
    <Col style="margin-right: var(--blocked-button-padding);">
      <MultiDropdown
        name="YouTube chat"
        store={channelFilters}
        getDisplayName={(n, v) => v.name}
        getBool={n => channelFilters.get(n).blacklist}
        setBool={(n, v) =>
          channelFilters.set(n, { ...channelFilters.get(n), blacklist: v })}
        bind:active={ytcActive}
      />
    </Col>
  {/if}
  {#if $enableMchadTLs && (!somethingActive || mchadActive)}
    <Col style="margin-left: var(--blocked-button-padding);">
      <MultiDropdown
        name="MChad"
        store={mchadUsers}
        bind:active={mchadActive}
      />
    </Col>
  {/if}
</Row>


<style>
  :global(.flex-dropdown-row) {
    max-width: 100%;
    margin-left: 0px !important;
    margin-right: 0px !important;
  }
  :global(.flex-dropdown-row .s-col) {
    padding: 0px !important;
    --blocked-button-padding: 5px;
  }
</style>