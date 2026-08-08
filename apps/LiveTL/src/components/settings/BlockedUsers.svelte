<script>
  import {
    channelFilters,
    mchadUsers,
    enableTldexTLs,
    spammersWhitelisted
  } from '../../js/store.js';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  import Card from '../common/Card.svelte';

  export let boundingDiv;

  let width = 0;
</script>

<Card title="Blocked/Whitelisted Users" icon="block" addHeaderClasses="block-and-whitelist">
  <div class="flex gap-2 flex-wrap flex-col" bind:clientWidth={width}>
    <div class="flex-1">
      <MultiDropdown
        name="Blocked Chat Users"
        store={channelFilters}
        getDisplayName={(n, v) => v.name}
        getBool={n => channelFilters.get(n).blacklist}
        setBool={(n, v) =>
          channelFilters.set(n, { ...channelFilters.get(n), blacklist: v })}
        {boundingDiv}
        {width}
      />
    </div>
    {#if $enableTldexTLs}
      <div class="flex-1">
        <MultiDropdown
          name="Blocked TLdex Users"
          store={mchadUsers}
          {boundingDiv}
          {width}
        />
      </div>
    {/if}
    <div class="flex-1">
      <MultiDropdown
        name="Whitelisted Users"
        store={spammersWhitelisted}
        getDisplayName={(n, v) => v.author}
        {boundingDiv}
        {width}
      />
    </div>
  </div>
</Card>
