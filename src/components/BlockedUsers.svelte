<script>
  import { Col, Row, Subheader } from 'svelte-materialify/src';
  import { channelFilters, enableMchadTLs, mchadUsers } from '../js/store.js';
  import MultiDropdown from './options/MultiDropdown.svelte';
</script>

<Subheader style="height: 1.5rem; margin-top: 1.5rem;">
  Blocked Users
</Subheader>

<Row>
  <Col style="padding-top:0px;">
    <MultiDropdown
      name="YouTube chat"
      store={channelFilters}
      getDisplayName={(n, v) => v.name}
      getBool={n => channelFilters.get(n).blacklist}
      setBool={(n, v) =>
        channelFilters.set(n, { ...channelFilters.get(n), blacklist: v })}
    />
  </Col>
  {#if $enableMchadTLs}
    <Col style="padding-top:0px">
      <MultiDropdown
        name="MChad"
        store={mchadUsers}
      />
    </Col>
  {/if}
</Row>
