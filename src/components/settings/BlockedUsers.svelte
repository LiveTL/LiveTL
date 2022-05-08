<script>
  import { channelFilters, enableMchadTLs, mchadUsers, enableTldexTLs } from '../../js/store.js';
  import MultiDropdown from '../options/MultiDropdown.svelte';
  import Card from '../common/Card.svelte';

  export let boundingDiv;

  let width = 0;
</script>

<Card title="Blocked Users" icon="block">
  <div class="flex gap-2 flex-wrap" bind:clientWidth={width}>
    <div class="flex-1">
      <MultiDropdown
        name="Chat users"
        store={channelFilters}
        getDisplayName={(n, v) => v.name}
        getBool={n => channelFilters.get(n).blacklist}
        setBool={(n, v) =>
          channelFilters.set(n, { ...channelFilters.get(n), blacklist: v })}
        {boundingDiv}
        {width}
      />
    </div>
    {#if $enableMchadTLs || $enableTldexTLs}
      <div class="flex-1">
        <MultiDropdown
          name="MChad / TLdex"
          store={mchadUsers}
          {boundingDiv}
          {width}
        />
      </div>
    {/if}
  </div>
</Card>
